-- Ejecuta esto en el SQL Editor de Supabase (en orden)

create table productos (
  id            serial primary key,
  nombre        text not null,
  categoria     text not null,
  precio        numeric not null default 0,
  costo         numeric not null default 0,
  stock         integer not null default 0,
  stock_minimo  integer not null default 0,
  talla         text,
  color         text,
  sku           text
);

create table ventas (
  id          serial primary key,
  items       jsonb not null default '[]',
  metodo_pago text not null,
  total       numeric not null,
  fecha       date not null default current_date,
  hora        text
);

create table separados (
  id               serial primary key,
  cliente          text not null,
  telefono         text,
  tipo             text not null default 'stock',
  producto         text not null,
  total            numeric not null default 0,
  abonado          numeric not null default 0,
  fecha_limite     date,
  notas            text,
  estado           text not null default 'activo',
  fecha_creacion   date default current_date
);

create table pedidos (
  id                      serial primary key,
  fabricante              text not null,
  productos               text,
  valor                   numeric default 0,
  fecha_pedido            date default current_date,
  fecha_llegada_estimada  date,
  clientes_esperando      text,
  estado                  text not null default 'pendiente'
);

create table facturas (
  id        serial primary key,
  cliente   text not null,
  telefono  text,
  items     jsonb not null default '[]',
  total     numeric not null,
  tipo      text not null default 'factura',
  fecha     date default current_date
);
