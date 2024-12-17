create table config
(
    key   text primary key,
    value text not null
);

create table users
(
    id         integer primary key generated always as identity,
    username   text unique,
    created_at timestamptz not null default now()
);

create table users_auth
(
    id                    integer primary key references users (id),
    discord_id            text unique
);

create type clip_status_enum as enum ('available', 'uploading', 'removed');

create table clips
(
    nid              integer primary key generated always as identity,
    id               text             not null unique,
    uploader_user_id integer          not null references users (id),
    title            text             not null,
    description      text             not null default '',
    video_extension  text             not null,
    status           clip_status_enum not null default 'uploading',
    created_at       timestamptz      not null default now()
);

create table refresh_tokens
(
    token      text primary key,
    user_id    integer     not null references users (id),
    created_at timestamptz not null default now()
);

create function perform_discord_auth(discord_acc_id text, discord_username text)
    returns table
            (
                user_id  integer,
                username text
            )
as
$$
declare
    newId       integer;
    newUsername text;
begin
    if exists (select 1 from users_auth ua where ua.discord_id = discord_acc_id) then
        return query (select u.id, u.username
                      from users_auth ua
                          join users u
                              on ua.id = u.id
                      where ua.discord_id = discord_acc_id);
    else
        if (select value from config where key = 'invite_only') then
            return;
        end if;

        if exists(select 1 from users u where u.username = discord_username) then
            newUsername := cast(floor(random() * 9999) as text);
        else
            newUsername := '';
        end if;
        insert into users(username)
        values (concat(discord_username, newUsername))
        returning users.id, users.username into newId, newUsername;
        insert into users_auth(id, discord_id) values (newId, discord_acc_id);
        return query (select newId, newUsername);
    end if;
end;
$$ language plpgsql;

insert into config
values ('db_version', '1'),
       ('invite_only', '1');