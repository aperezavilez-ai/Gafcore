-- Inserciones sin `name` explícito ya no usan el literal «Nuevo Proyecto».
alter table public.projects alter column name set default 'Proyecto';