create table if not exists public.usuarios_privados (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  cpf text,
  telefone text,
  endereco text,
  cidade text,
  estado text,
  cep text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists usuarios_privados_set_updated_at on public.usuarios_privados;
create trigger usuarios_privados_set_updated_at
before update on public.usuarios_privados
for each row
execute function public.set_updated_at();

alter table public.usuarios_privados enable row level security;

-- Migrar dados já existentes para preservar compatibilidade.
insert into public.usuarios_privados (user_id, cpf, telefone, endereco, cidade, estado, cep)
select user_id, cpf, telefone, endereco, cidade, estado, null::text as cep
from public.usuarios_publico
where user_id is not null
on conflict (user_id) do update set
  cpf = excluded.cpf,
  telefone = excluded.telefone,
  endereco = excluded.endereco,
  cidade = excluded.cidade,
  estado = excluded.estado,
  cep = coalesce(public.usuarios_privados.cep, excluded.cep),
  updated_at = timezone('utc'::text, now());

update public.usuarios_publico
set cpf = null,
    telefone = null,
    endereco = null,
    cidade = null,
    estado = null
where user_id is not null;

-- Política para leitura e escrita apenas do próprio usuário.
drop policy if exists "usuarios_privados_select_own" on public.usuarios_privados;
create policy "usuarios_privados_select_own"
on public.usuarios_privados for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "usuarios_privados_insert_own" on public.usuarios_privados;
create policy "usuarios_privados_insert_own"
on public.usuarios_privados for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "usuarios_privados_update_own" on public.usuarios_privados;
create policy "usuarios_privados_update_own"
on public.usuarios_privados for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "usuarios_privados_delete_own" on public.usuarios_privados;
create policy "usuarios_privados_delete_own"
on public.usuarios_privados for delete
to authenticated
using (auth.uid() = user_id);

-- Permitir acesso administrativo do backend.
drop policy if exists "usuarios_privados_service_role_all" on public.usuarios_privados;
create policy "usuarios_privados_service_role_all"
on public.usuarios_privados for all
to service_role
using (true)
with check (true);

comment on table public.usuarios_privados is 'Dados pessoais sensíveis do usuário, acessíveis apenas ao próprio usuário e ao backend.';
