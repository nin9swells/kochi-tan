create table hosts(
host_owner varchar,
host_ip varchar,
host_start_time datetime,
host_note text
);

create table earth_vpn(
earth_vpn_ip varchar(15),
earth_vpn_name varchar(32)
);

create table greetingstatus(
id tinyint
);
insert into greeting status value (1)
where not exists (select id from greetingstatus);
