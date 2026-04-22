-- =============================================
-- Script para importar la base de datos POS
-- Ejecutar en DBeaver conectado a "postgres"
-- =============================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- =============================================
-- CREAR TABLAS
-- =============================================

CREATE TABLE IF NOT EXISTS public.roles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    nombre character varying(50) NOT NULL UNIQUE,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.usuarios (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    nombre character varying(100) NOT NULL,
    correo character varying(100) NOT NULL UNIQUE,
    contrasena text NOT NULL,
    rol_id uuid REFERENCES public.roles(id),
    estado boolean DEFAULT true,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.categorias (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    nombre character varying(100) NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.productos (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    nombre character varying(150) NOT NULL,
    descripcion text,
    imagen_url text,
    precio numeric(10,2) NOT NULL,
    stock integer DEFAULT 0,
    categoria_id uuid REFERENCES public.categorias(id),
    codigo_barras character varying(100),
    estado boolean DEFAULT true,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.productos
ADD COLUMN IF NOT EXISTS imagen_url text;

CREATE TABLE IF NOT EXISTS public.cajas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    monto_apertura numeric(10,2) NOT NULL,
    monto_cierre numeric(10,2),
    abierto_por uuid REFERENCES public.usuarios(id),
    cerrado_por uuid REFERENCES public.usuarios(id),
    fecha_apertura timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre timestamp without time zone,
    estado character varying(20) DEFAULT 'ABIERTA'
);

CREATE TABLE IF NOT EXISTS public.ventas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    usuario_id uuid REFERENCES public.usuarios(id),
    caja_id uuid REFERENCES public.cajas(id),
    total numeric(10,2) NOT NULL,
    metodo_pago character varying(50),
    estado character varying(20) DEFAULT 'COMPLETADA',
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.detalle_ventas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    venta_id uuid REFERENCES public.ventas(id) ON DELETE CASCADE,
    producto_id uuid REFERENCES public.productos(id),
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.movimientos_caja (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    caja_id uuid REFERENCES public.cajas(id),
    tipo character varying(20) NOT NULL,
    monto numeric(10,2) NOT NULL,
    descripcion text,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.cola_offline (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    tipo_accion character varying(50),
    datos jsonb,
    estado character varying(20) DEFAULT 'PENDIENTE',
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INSERTAR DATOS
-- =============================================

-- Roles
INSERT INTO public.roles (id, nombre, creado_en) VALUES
('b3cc543d-ad26-4a87-a4c2-ceeedc3359c1', 'ADMIN', '2026-03-23 22:27:09.264697'),
('4664d4a4-e994-4742-91fd-0de146bd4932', 'CAJERO', '2026-03-23 22:27:09.264697')
ON CONFLICT (id) DO NOTHING;

-- Usuarios
INSERT INTO public.usuarios (id, nombre, correo, contrasena, rol_id, estado, creado_en, actualizado_en) VALUES
('6fc295f2-72e2-4f6b-b8b8-35268d781640', 'Administrador', 'admin@pos.com', '123456', 'b3cc543d-ad26-4a87-a4c2-ceeedc3359c1', true, '2026-03-23 22:27:09.266814', '2026-03-23 22:27:09.266814'),
('25c6d140-c32f-4b01-b7f7-4ff682232cdc', 'Cajero Principal', 'cajero@pos.com', '123456', '4664d4a4-e994-4742-91fd-0de146bd4932', true, '2026-03-23 23:20:23.573362', '2026-03-23 23:20:23.573362')
ON CONFLICT (id) DO NOTHING;

-- Categorias
INSERT INTO public.categorias (id, nombre, creado_en) VALUES
('419d00b2-0c7f-4ba2-b92d-166703f1d501', 'Bebidas', '2026-03-23 23:21:00.711799'),
('1b1fad0c-7fea-4852-b1bd-cf9e89b14711', 'Snacks', '2026-03-23 23:21:00.711799'),
('79dee748-a927-4043-86a3-941b98f594c6', 'Lácteos', '2026-03-23 23:21:00.711799'),
('3cdbc862-31f1-4236-9875-ed106bee9007', 'Aseo', '2026-03-23 23:21:00.711799'),
('f7e9d40c-a6bf-4bb0-b71e-68aa430b425b', 'Granos', '2026-03-23 23:21:00.711799')
ON CONFLICT (id) DO NOTHING;

-- Productos
INSERT INTO public.productos (id, nombre, descripcion, imagen_url, precio, stock, categoria_id, codigo_barras, estado, creado_en, actualizado_en) VALUES
('4b20c65f-31cb-42cc-ad16-e77ae5938958', 'Coca-Cola 400ml', 'Bebida gaseosa', NULL, 3500.00, 50, '419d00b2-0c7f-4ba2-b92d-166703f1d501', '7701', true, '2026-03-23 23:21:19.706686', '2026-03-23 23:21:19.706686'),
('0a29500a-d951-47a9-b8fd-a1874345fe21', 'Pepsi 400ml', 'Bebida gaseosa', NULL, 3400.00, 40, '419d00b2-0c7f-4ba2-b92d-166703f1d501', '7702', true, '2026-03-23 23:21:19.706686', '2026-03-23 23:21:19.706686'),
('c980652b-cb13-471d-b6c8-394c770f04d1', 'Agua Cristal', 'Agua sin gas', NULL, 2500.00, 60, '419d00b2-0c7f-4ba2-b92d-166703f1d501', '7703', true, '2026-03-23 23:21:19.706686', '2026-03-23 23:21:19.706686'),
('9f7ddcd8-27d2-4a3e-bb05-48cab953c3a5', 'Red Bull', 'Energizante', NULL, 8000.00, 20, '419d00b2-0c7f-4ba2-b92d-166703f1d501', '7704', true, '2026-03-23 23:21:19.706686', '2026-03-23 23:21:19.706686'),
('ff2fc5e7-701f-4217-8b85-e29ceed6ef0b', 'Jugo Hit', 'Jugo en botella', NULL, 3000.00, 35, '419d00b2-0c7f-4ba2-b92d-166703f1d501', '7705', true, '2026-03-23 23:21:19.706686', '2026-03-23 23:21:19.706686'),
('bc696062-ed2a-4bd3-a4f6-b887f53ff859', 'Galletas Oreo', 'Galletas chocolate', NULL, 3000.00, 40, '1b1fad0c-7fea-4852-b1bd-cf9e89b14711', '7706', true, '2026-03-23 23:21:19.706686', '2026-03-23 23:21:19.706686'),
('095802bd-c47f-491d-b066-49d15efb24ec', 'Chocorramo', 'Ponqué', NULL, 2500.00, 45, '1b1fad0c-7fea-4852-b1bd-cf9e89b14711', '7707', true, '2026-03-23 23:21:19.706686', '2026-03-23 23:21:19.706686'),
('3e533d54-a891-4d05-af37-e70d104a0db0', 'Papas Margarita', 'Papas fritas', NULL, 3500.00, 50, '1b1fad0c-7fea-4852-b1bd-cf9e89b14711', '7708', true, '2026-03-23 23:21:19.706686', '2026-03-23 23:21:19.706686'),
('ddd62285-2db6-4a11-b596-b21bf77d6ef3', 'Leche 1L', 'Leche entera', NULL, 4200.00, 30, '79dee748-a927-4043-86a3-941b98f594c6', '7709', true, '2026-03-23 23:21:19.706686', '2026-03-23 23:21:19.706686'),
('17d4d77d-6cf9-441c-a2ce-7ba804333947', 'Yogurt', 'Yogurt fresa', NULL, 2800.00, 25, '79dee748-a927-4043-86a3-941b98f594c6', '7710', true, '2026-03-23 23:21:19.706686', '2026-03-23 23:21:19.706686'),
('0a8a377c-6d70-4daa-82ac-4119036689b6', 'Detergente', 'Ariel polvo', NULL, 8500.00, 15, '3cdbc862-31f1-4236-9875-ed106bee9007', '7711', true, '2026-03-23 23:21:19.706686', '2026-03-23 23:21:19.706686'),
('61b7a5a3-d5bf-47f7-a457-fe05bb910161', 'Jabón Rey', 'Jabón azul', NULL, 2500.00, 40, '3cdbc862-31f1-4236-9875-ed106bee9007', '7712', true, '2026-03-23 23:21:19.706686', '2026-03-23 23:21:19.706686'),
('22d96cf1-0d6b-4e5d-90fa-8534d15f8bb3', 'Arroz 1kg', 'Arroz blanco', NULL, 4500.00, 60, 'f7e9d40c-a6bf-4bb0-b71e-68aa430b425b', '7713', true, '2026-03-23 23:21:19.706686', '2026-03-23 23:21:19.706686'),
('95d42197-dbe6-4349-b137-d102ea052d00', 'Lentejas', 'Lentejas 500g', NULL, 3000.00, 50, 'f7e9d40c-a6bf-4bb0-b71e-68aa430b425b', '7714', true, '2026-03-23 23:21:19.706686', '2026-03-23 23:21:19.706686'),
('951de1d5-e85f-4d67-8b22-b003b9dce458', 'Frijoles', 'Frijol rojo', NULL, 3200.00, 45, 'f7e9d40c-a6bf-4bb0-b71e-68aa430b425b', '7715', true, '2026-03-23 23:21:19.706686', '2026-03-23 23:21:19.706686'),
('107da609-f16b-461b-922b-a9817401adcc', 'Coca-Cola 400ml', 'Bebida gaseosa', NULL, 3500.00, 50, '419d00b2-0c7f-4ba2-b92d-166703f1d501', '7701001', true, '2026-03-23 23:27:27.550692', '2026-03-23 23:27:27.550692'),
('7762b70f-61c3-4a5c-82aa-ecfa8c50190c', 'Pepsi 400ml', 'Bebida gaseosa', NULL, 3400.00, 40, '419d00b2-0c7f-4ba2-b92d-166703f1d501', '7701002', true, '2026-03-23 23:27:27.550692', '2026-03-23 23:27:27.550692'),
('3936e787-9987-41d2-8dc6-3dda81e83050', 'Agua Cristal 600ml', 'Agua sin gas', NULL, 2500.00, 60, '419d00b2-0c7f-4ba2-b92d-166703f1d501', '7701003', true, '2026-03-23 23:27:27.550692', '2026-03-23 23:27:27.550692'),
('303d7cf1-8388-4534-b3f4-0b225cfb921c', 'Galletas Oreo', 'Galletas de chocolate', NULL, 3000.00, 35, '1b1fad0c-7fea-4852-b1bd-cf9e89b14711', '7701004', true, '2026-03-23 23:27:27.550692', '2026-03-23 23:27:27.550692'),
('d465ceed-2bc0-46e7-b920-4ed967bd080f', 'Chocorramo', 'Ponqué cubierto de chocolate', NULL, 2500.00, 45, '1b1fad0c-7fea-4852-b1bd-cf9e89b14711', '7701005', true, '2026-03-23 23:27:27.550692', '2026-03-23 23:27:27.550692')
ON CONFLICT (id) DO NOTHING;

-- Cajas
INSERT INTO public.cajas (id, monto_apertura, monto_cierre, abierto_por, cerrado_por, fecha_apertura, fecha_cierre, estado) VALUES
('f6b98fc1-0bbe-4a4b-8a8f-380c737abab8', 100000.00, 150000.00, '25c6d140-c32f-4b01-b7f7-4ff682232cdc', '25c6d140-c32f-4b01-b7f7-4ff682232cdc', '2026-03-23 23:21:32.79179', NULL, 'CERRADA'),
('9b0828cf-ec6c-427c-b52c-20cf746152fb', 120000.00, NULL, '25c6d140-c32f-4b01-b7f7-4ff682232cdc', NULL, '2026-03-23 23:21:32.79179', NULL, 'ABIERTA'),
('66f21b9b-1ce0-4adf-9dd4-596094d796c8', 90000.00, 130000.00, '25c6d140-c32f-4b01-b7f7-4ff682232cdc', '25c6d140-c32f-4b01-b7f7-4ff682232cdc', '2026-03-23 23:21:32.79179', NULL, 'CERRADA'),
('9e218610-ed7e-47a6-a6f2-a63adfc82189', 80000.00, 110000.00, '25c6d140-c32f-4b01-b7f7-4ff682232cdc', '25c6d140-c32f-4b01-b7f7-4ff682232cdc', '2026-03-23 23:21:32.79179', NULL, 'CERRADA'),
('e0e04616-3dd6-4d8e-8e65-63684d0b183a', 150000.00, NULL, '25c6d140-c32f-4b01-b7f7-4ff682232cdc', NULL, '2026-03-23 23:21:32.79179', NULL, 'ABIERTA')
ON CONFLICT (id) DO NOTHING;

-- Ventas
INSERT INTO public.ventas (id, usuario_id, caja_id, total, metodo_pago, estado, creado_en) VALUES
('812fc498-5495-4291-8171-5313eb69fd9e', '25c6d140-c32f-4b01-b7f7-4ff682232cdc', 'f6b98fc1-0bbe-4a4b-8a8f-380c737abab8', 10400.00, 'EFECTIVO', 'COMPLETADA', '2026-03-23 23:28:03.321773'),
('2e6819b4-6abc-4018-8574-20396064ca4e', '25c6d140-c32f-4b01-b7f7-4ff682232cdc', '9b0828cf-ec6c-427c-b52c-20cf746152fb', 7500.00, 'TARJETA', 'COMPLETADA', '2026-03-23 23:28:03.321773'),
('9acfd922-1eb3-4415-819f-1d885d2f0ee6', '25c6d140-c32f-4b01-b7f7-4ff682232cdc', '66f21b9b-1ce0-4adf-9dd4-596094d796c8', 16000.00, 'EFECTIVO', 'COMPLETADA', '2026-03-23 23:28:03.321773'),
('8a10470b-dfdc-48e7-9daf-aa59538afab6', '25c6d140-c32f-4b01-b7f7-4ff682232cdc', '9e218610-ed7e-47a6-a6f2-a63adfc82189', 3000.00, 'TRANSFERENCIA', 'COMPLETADA', '2026-03-23 23:28:03.321773'),
('8865d2fb-7fbf-4b2a-aabf-e3651931276c', '25c6d140-c32f-4b01-b7f7-4ff682232cdc', 'e0e04616-3dd6-4d8e-8e65-63684d0b183a', 5900.00, 'EFECTIVO', 'COMPLETADA', '2026-03-23 23:28:03.321773')
ON CONFLICT (id) DO NOTHING;

-- Detalle ventas
INSERT INTO public.detalle_ventas (id, venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
('85f57507-d47b-4d98-8946-5f3348b99f74', '812fc498-5495-4291-8171-5313eb69fd9e', '4b20c65f-31cb-42cc-ad16-e77ae5938958', 2, 3500.00, 7000.00),
('7507b0df-5a74-471e-96cf-d0d7b6f31d7e', '812fc498-5495-4291-8171-5313eb69fd9e', '0a29500a-d951-47a9-b8fd-a1874345fe21', 1, 3400.00, 3400.00),
('cb743ab4-a1a6-43f6-a8a9-6d5a7e3d040a', '2e6819b4-6abc-4018-8574-20396064ca4e', '3936e787-9987-41d2-8dc6-3dda81e83050', 3, 2500.00, 7500.00),
('ac215064-1699-4bd7-9398-d5cf8b3fc273', '9acfd922-1eb3-4415-819f-1d885d2f0ee6', 'bc696062-ed2a-4bd3-a4f6-b887f53ff859', 2, 3000.00, 6000.00),
('8750620f-97ad-4de7-bd12-a6ad8e09f819', '8a10470b-dfdc-48e7-9daf-aa59538afab6', '095802bd-c47f-491d-b066-49d15efb24ec', 1, 2500.00, 2500.00)
ON CONFLICT (id) DO NOTHING;

-- Movimientos caja
INSERT INTO public.movimientos_caja (id, caja_id, tipo, monto, descripcion, creado_en) VALUES
('31f64f33-da36-426f-bf33-a5c5b83d7831', 'f6b98fc1-0bbe-4a4b-8a8f-380c737abab8', 'INGRESO', 50000.00, 'Ventas del día', '2026-03-23 23:27:53.139823'),
('87168166-5462-46ca-b519-ef2bf297343a', 'f6b98fc1-0bbe-4a4b-8a8f-380c737abab8', 'EGRESO', 10000.00, 'Compra de insumos', '2026-03-23 23:27:53.139823'),
('c4bf3ca4-4e03-44a7-9638-f35314a1a8cb', '9b0828cf-ec6c-427c-b52c-20cf746152fb', 'INGRESO', 70000.00, 'Ingreso por ventas', '2026-03-23 23:27:53.139823'),
('267b5db3-efe4-4279-b7d9-97bb96a26e1e', '66f21b9b-1ce0-4adf-9dd4-596094d796c8', 'EGRESO', 20000.00, 'Pago a proveedor', '2026-03-23 23:27:53.139823'),
('52943956-d0dc-4dc1-a093-32184af77f38', '9e218610-ed7e-47a6-a6f2-a63adfc82189', 'INGRESO', 30000.00, 'Ingreso adicional', '2026-03-23 23:27:53.139823')
ON CONFLICT (id) DO NOTHING;

-- Verificación final
SELECT 'IMPORTACIÓN EXITOSA' AS resultado,
       (SELECT COUNT(*) FROM roles) AS roles,
       (SELECT COUNT(*) FROM usuarios) AS usuarios,
       (SELECT COUNT(*) FROM categorias) AS categorias,
       (SELECT COUNT(*) FROM productos) AS productos,
       (SELECT COUNT(*) FROM cajas) AS cajas,
       (SELECT COUNT(*) FROM ventas) AS ventas;
