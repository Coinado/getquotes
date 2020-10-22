--drop table quotes;

create table quotes (
  time timestamp default current_timestamp,
  symbol varchar(10),
  price float
);
