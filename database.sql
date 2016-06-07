
-- sqlite3 Biblioteca.db  (abrir sqlite con la BD llamada Biblioteca)
-- .read crearBiblioteca.sql
-- .tables
-- .schema
-- .quit

-- borra la tabla Persona
drop table User;
drop table Logged_in_users;
drop table Messages;
--drop table Number;

-- crea la tabla User
create table User (
	email varchar(30) not null,
	password varchar(30) not null,
	firstname varchar(30) not null,
	familyname varchar(30) not null,
	gender varchar(30) not null,
	city varchar(30) not null,
	country varchar(30) not null,
	
	primary key (email)
	);

-- crea la tabla Loged_in_users
create table Logged_in_users(
	email varchar(30) not null,
	token varchar(40) not null,
	
	foreign key (email) references User(email) on delete cascade,

	primary key (email)
	);	 

-- crea la tabla Messages
create table Messages(
	fromEmail varchar (30) not null,
	toEmail varchar(30) not null,
	message varchar(125) not null,
--	number smallint not null,
	
	foreign key (toEmail) references User(email) on delete cascade,
	foreign key (fromEmail) references User(email) on delete cascade,
	
	primary key (toEmail, fromEmail, message)
	);
	
-- crea la tabla Number
--create table Number (
--	email varchar(30) not null,
--	last smallint not null,
--	
--	foreign key (email) references User(email) on delete cascade,
--
--	primary key (email)
--	);




--  inserta una registro en User
insert into User values ('el@dejan', '1234','Juan', 'Perez', 'Male', 'La gomera', 'Spain');
insert into User values ('ella@dejan', '5678','Susana', 'Gusano', 'Female', 'Fuerteventura', 'Spain');


--  inserta una registro en Loged_in_users
insert into Logged_in_users values ('el@dejan', 'pmov65498168');
--insert into Loged_in_users values ('ella@dejan', 'mat2asdasfas');

--  inserta una registro en Messages
insert into Messages values ('el@dejan', 'el@dejan', 'Oye esto es el primer mensaje');
insert into Messages values ('el@dejan', 'ella@dejan', 'Oye este es el segundo mensaje');
insert into Messages values ('ella@dejan', 'ella@dejan', 'KAN primer mensaje');
insert into Messages values ('ella@dejan', 'el@dejan', 'KAN segundo mensaje');

--  inserta una registro en Number
--insert into Number values ('el@dejan', 3);
--insert into Number values ('ella@dejan', 2);










--select dni from Persona where nombre='Jose';
--select * from Persona;
--select nombre, apellidos from Persona;
--select nombre, apellidos from Persona where nombre = 'Jose';

--select Persona.nombre from Asignatura, Matriculados, Persona 
--	where Asignatura.nombre= 'pmov' 
--	and Asignatura.codigo = Matriculados.codigo
--	and Matriculados.dni = Persona.dni;



-- trabajo para la semana que viene:
-- crear el diseño: Persona, Asignatura, Matriculados de la pizarra
-- insertar datos en las tablas

-- probarlo ejecutando el fichero con sqlite3.exe
-- y hacer consultas sencillas

--  select con varias tablas:
--  nombre de todos los matriculados en "pmov"

-- select Persona.nombre from Asignatura,Matriculados,Persona where
-- Asignatura.nombre='pmov' and Asignatura.codigo = Matriculados.codigo 
  -- and Matriculados.dni = Persona.dni;
