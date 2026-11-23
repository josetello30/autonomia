-- P3-62 y P3-63: licencias de GestIA.
--
-- La compra simulada (S/ 39) crea la licencia de la cuenta. Con ella, la landing muestra la
-- descarga y la app de escritorio activa el equipo. No hay datos de pago: solo cuenta, compra y
-- equipos (identificados por un hash, nunca por datos del equipo en claro).
--
-- Escrituras solo mediante funciones SECURITY DEFINER que actúan sobre auth.uid(): nadie puede
-- crear una compra ni activar un equipo para otra cuenta, y no hace falta la clave service_role.

-- ---------------------------------------------------------------------------------------------
-- Compras (una por cuenta: es la licencia)
-- ---------------------------------------------------------------------------------------------
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  amount_pen numeric(6, 2) not null default 39.00 check (amount_pen = 39.00),
  currency text not null default 'PEN' check (currency = 'PEN'),
  simulated boolean not null default true check (simulated),
  created_at timestamptz not null default now()
);

comment on table public.purchases is
  'Licencia de GestIA: compra simulada de S/ 39, una por cuenta. Sin datos de pago.';

alter table public.purchases enable row level security;

create policy "Cada cuenta ve su propia compra"
  on public.purchases for select to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------------------------
-- Equipos activados (hasta 3 por cuenta)
-- ---------------------------------------------------------------------------------------------
create table public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  device_hash text not null check (device_hash ~ '^[0-9a-f]{64}$'),
  label text check (char_length(label) <= 80),
  activated_at timestamptz not null default now(),
  last_validated_at timestamptz not null default now(),
  unique (user_id, device_hash)
);

comment on table public.devices is
  'Equipos donde la app validó la licencia. device_hash es SHA-256 del identificador del equipo.';

create index devices_user_id_idx on public.devices (user_id);

alter table public.devices enable row level security;

create policy "Cada cuenta ve sus equipos"
  on public.devices for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Cada cuenta puede quitar sus equipos"
  on public.devices for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------------------------
-- Compra simulada (landing)
-- ---------------------------------------------------------------------------------------------
create function public.simulate_purchase()
returns public.purchases
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  result public.purchases;
begin
  if current_user_id is null then
    raise exception 'Se necesita iniciar sesión' using errcode = '28000';
  end if;

  insert into public.purchases (user_id)
  values (current_user_id)
  on conflict (user_id) do nothing;

  select * into result from public.purchases where user_id = current_user_id;
  return result;
end;
$$;

comment on function public.simulate_purchase() is
  'Registra la compra simulada de la cuenta con sesión iniciada. Idempotente.';

-- ---------------------------------------------------------------------------------------------
-- Activación y revalidación del equipo (app de escritorio, cada 30 días como máximo)
-- ---------------------------------------------------------------------------------------------
create function public.activate_device(p_device_hash text, p_label text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  purchase public.purchases;
  device public.devices;
  active_devices integer;
begin
  if current_user_id is null then
    raise exception 'Se necesita iniciar sesión' using errcode = '28000';
  end if;
  if p_device_hash is null or p_device_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Identificador de equipo no válido' using errcode = '22023';
  end if;

  select * into purchase from public.purchases where user_id = current_user_id;
  if not found then
    return jsonb_build_object('licensed', false);
  end if;

  select count(*) into active_devices
  from public.devices
  where user_id = current_user_id and device_hash <> p_device_hash;
  if active_devices >= 3 and not exists (
    select 1 from public.devices
    where user_id = current_user_id and device_hash = p_device_hash
  ) then
    raise exception 'La licencia ya está activada en 3 equipos'
      using errcode = 'P0001', hint = 'Quite un equipo desde «Mi cuenta» en la web.';
  end if;

  insert into public.devices (user_id, device_hash, label)
  values (current_user_id, p_device_hash, left(p_label, 80))
  on conflict (user_id, device_hash)
  do update set last_validated_at = now(),
                label = coalesce(excluded.label, public.devices.label)
  returning * into device;

  return jsonb_build_object(
    'licensed', true,
    'purchased_at', purchase.created_at,
    'device_id', device.id,
    'validated_at', device.last_validated_at,
    'valid_days', 30
  );
end;
$$;

comment on function public.activate_device(text, text) is
  'Activa o revalida el equipo de la cuenta con sesión; requiere compra. Máximo 3 equipos.';

-- Solo cuentas con sesión pueden llamar a estas funciones.
revoke all on function public.simulate_purchase() from public, anon;
revoke all on function public.activate_device(text, text) from public, anon;
grant execute on function public.simulate_purchase() to authenticated;
grant execute on function public.activate_device(text, text) to authenticated;
