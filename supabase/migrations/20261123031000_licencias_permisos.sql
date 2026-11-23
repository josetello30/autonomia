-- Los proyectos nuevos de Supabase no dan permisos de tabla a los roles de la API.
-- Se concede solo lo que las políticas RLS necesitan; las escrituras van por las funciones.
revoke all on public.purchases from anon, authenticated;
revoke all on public.devices from anon, authenticated;
grant select on public.purchases to authenticated;
grant select, delete on public.devices to authenticated;
