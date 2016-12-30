create table hosts(
host_owner varchar,
host_ip varchar,
host_start_time datetime,
host_note text
);

create table greetingstatus(
id tinyint
);
insert into greeting status value (1)
where not exists (select id from greetingstatus);
