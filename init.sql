--drop table quotes;

create table quotoes (
  time timestamp default current_timestamp,
  symbol varchar(10),
  price float
);
