-- P3-30: métricas de impacto anónimas (con consentimiento) y comentarios de la app de escritorio.
--
-- La app envía con la clave publicable (rol anon): no hace falta sesión y los datos no quedan
-- ligados a ninguna cuenta. Nadie puede leer estas tablas desde la API: solo el equipo y las
-- organizaciones aliadas, desde el panel de Supabase (vista public.impacto_diario).
--
-- Escrituras solo mediante funciones SECURITY DEFINER que validan cada campo: no se aceptan
-- claves desconocidas, textos largos ni valores fuera de rango.

-- ---------------------------------------------------------------------------------------------
-- Reportes diarios de uso (uno por instalación y día)
-- ---------------------------------------------------------------------------------------------
create table public.usage_reports (
  id uuid primary key default gen_random_uuid(),
  install_id uuid not null,
  day date not null,
  app_version text not null check (char_length(app_version) <= 20),
  os text not null check (char_length(os) <= 20),
  sessions integer not null check (sessions between 0 and 500),
  active_minutes integer not null check (active_minutes between 0 and 1440),
  actions jsonb not null default '{}'::jsonb,
  features jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  unique (install_id, day)
);

comment on table public.usage_reports is
  'P3-30: uso diario anónimo con consentimiento. install_id es aleatorio, no ligado a cuentas.';

alter table public.usage_reports enable row level security;

-- ---------------------------------------------------------------------------------------------
-- Comentarios
-- ---------------------------------------------------------------------------------------------
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('sugerencia', 'problema', 'agradecimiento')),
  message text not null check (char_length(message) between 3 and 1000),
  contact text check (contact is null or (char_length(contact) <= 120 and contact ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  app_version text not null check (char_length(app_version) <= 20),
  os text not null check (char_length(os) <= 20),
  received_at timestamptz not null default now()
);

comment on table public.feedback is
  'P3-30: comentarios enviados desde la app. contact solo existe si la persona lo escribió.';

alter table public.feedback enable row level security;

-- Sin políticas: con RLS activado, anon y authenticated no leen ni escriben directamente.
revoke all on public.usage_reports from anon, authenticated;
revoke all on public.feedback from anon, authenticated;

-- ---------------------------------------------------------------------------------------------
-- Recepción de reportes
-- ---------------------------------------------------------------------------------------------
create function public.submit_usage_report(p_report jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed_actions constant text[] := array[
    'left_click', 'right_click', 'double_click', 'drag', 'pause', 'recalibrate', 'scroll',
    'quick_menu'];
  allowed_features constant text[] := array[
    'teclado', 'acciones_rapidas', 'calibracion', 'tutorial_completado', 'practica'];
  report_day date;
  item record;
begin
  if p_report is null or jsonb_typeof(p_report) <> 'object' then
    raise exception 'Reporte no válido' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_object_keys(p_report) as k
    where k not in ('schema', 'install_id', 'app_version', 'os', 'day', 'sessions',
                    'active_minutes', 'actions', 'features')
  ) or (p_report ->> 'schema') is distinct from '1' then
    raise exception 'Reporte con campos no permitidos' using errcode = '22023';
  end if;
  if jsonb_typeof(p_report -> 'actions') <> 'object'
     or jsonb_typeof(p_report -> 'features') <> 'object' then
    raise exception 'Contadores no válidos' using errcode = '22023';
  end if;
  for item in select key, value from jsonb_each(p_report -> 'actions') loop
    if item.key <> all (allowed_actions) or jsonb_typeof(item.value) <> 'number'
       or (item.value)::numeric not between 0 and 100000 then
      raise exception 'Acción no válida: %', item.key using errcode = '22023';
    end if;
  end loop;
  for item in select key, value from jsonb_each(p_report -> 'features') loop
    if item.key <> all (allowed_features) or jsonb_typeof(item.value) <> 'number'
       or (item.value)::numeric not between 0 and 100000 then
      raise exception 'Función no válida: %', item.key using errcode = '22023';
    end if;
  end loop;

  begin
    report_day := (p_report ->> 'day')::date;
  exception when others then
    raise exception 'Fecha no válida' using errcode = '22023';
  end;
  if report_day > current_date + 1 or report_day < current_date - 60 then
    raise exception 'Fecha fuera de rango' using errcode = '22023';
  end if;

  -- Un reenvío del mismo día (por ejemplo, tras perder la conexión) reemplaza al anterior.
  insert into public.usage_reports
    (install_id, day, app_version, os, sessions, active_minutes, actions, features)
  values (
    (p_report ->> 'install_id')::uuid,
    report_day,
    left(p_report ->> 'app_version', 20),
    left(p_report ->> 'os', 20),
    (p_report ->> 'sessions')::integer,
    (p_report ->> 'active_minutes')::integer,
    p_report -> 'actions',
    p_report -> 'features'
  )
  on conflict (install_id, day) do update
    set app_version = excluded.app_version,
        os = excluded.os,
        sessions = excluded.sessions,
        active_minutes = excluded.active_minutes,
        actions = excluded.actions,
        features = excluded.features,
        received_at = now();
exception
  when invalid_text_representation or numeric_value_out_of_range or check_violation
       or not_null_violation then
    raise exception 'Reporte no válido' using errcode = '22023';
end;
$$;

comment on function public.submit_usage_report(jsonb) is
  'P3-30: guarda el reporte diario anónimo de la app; valida todas las claves y rangos.';

-- ---------------------------------------------------------------------------------------------
-- Recepción de comentarios
-- ---------------------------------------------------------------------------------------------
create function public.submit_feedback(p_feedback jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_feedback is null or jsonb_typeof(p_feedback) <> 'object' or exists (
    select 1 from jsonb_object_keys(p_feedback) as k
    where k not in ('category', 'message', 'contact', 'app_version', 'os')
  ) then
    raise exception 'Comentario no válido' using errcode = '22023';
  end if;

  insert into public.feedback (category, message, contact, app_version, os)
  values (
    p_feedback ->> 'category',
    p_feedback ->> 'message',
    nullif(p_feedback ->> 'contact', ''),
    left(p_feedback ->> 'app_version', 20),
    left(p_feedback ->> 'os', 20)
  );
exception
  when check_violation or not_null_violation then
    raise exception 'Comentario no válido' using errcode = '22023';
end;
$$;

comment on function public.submit_feedback(jsonb) is
  'P3-30: guarda un comentario enviado desde la app de escritorio.';

revoke all on function public.submit_usage_report(jsonb) from public;
revoke all on function public.submit_feedback(jsonb) from public;
grant execute on function public.submit_usage_report(jsonb) to anon, authenticated;
grant execute on function public.submit_feedback(jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------------------------------
-- Resumen de impacto para el equipo y las organizaciones aliadas (solo desde el panel)
-- ---------------------------------------------------------------------------------------------
create view public.impacto_diario
with (security_invoker = true) as
select
  day as dia,
  count(*) as instalaciones_activas,
  sum(sessions) as sesiones,
  sum(active_minutes) as minutos_de_uso,
  round(avg(active_minutes)) as minutos_promedio,
  count(*) filter (where (features ->> 'tutorial_completado')::integer > 0)
    as completaron_tutorial,
  count(*) filter (where (features ->> 'teclado')::integer > 0) as usaron_teclado
from public.usage_reports
group by day
order by day desc;

comment on view public.impacto_diario is
  'P3-30: instalaciones activas, sesiones y minutos de uso por día (sin datos personales).';

revoke all on public.impacto_diario from anon, authenticated;
