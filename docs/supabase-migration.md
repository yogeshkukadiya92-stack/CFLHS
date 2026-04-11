# Supabase Migration

This Habit Share app now expects Supabase for auth and the social habit data flow.

## Environment variables

Add these variables in local `.env.local` and Railway:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Required tables

Create these tables in Supabase:

### `profiles`

- `id` `uuid` primary key
- `email` `text` unique
- `name` `text`
- `avatar_url` `text`
- `branch` `text`
- `role` `text`
- `permissions` `jsonb`
- `created_at` `timestamptz` default `now()`
- `updated_at` `timestamptz` default `now()`

### `habit_share_habits`

- `id` `text` primary key
- `user_id` `uuid`
- `user_name` `text`
- `user_email` `text`
- `group_id` `text` (nullable)
- `group_name` `text` (nullable)
- `name` `text`
- `description` `text`
- `check_ins` `text[]` default `'{}'`
- `cheers` `integer` default `0`
- `is_shared` `boolean` default `false`
- `shared_with_ids` `text[]` default `'{}'`
- `shared_with_groups` `text[]` default `'{}'`
- `created_at` `timestamptz` default `now()`
- `updated_at` `timestamptz` default `now()`

### `habit_gratitude_entries`

- `id` `text` primary key
- `user_id` `uuid`
- `user_name` `text`
- `user_email` `text`
- `group_id` `text` (nullable)
- `group_name` `text` (nullable)
- `content` `text`
- `entry_date` `text`
- `is_shared` `boolean` default `false`
- `shared_with_ids` `text[]` default `'{}'`
- `shared_with_groups` `text[]` default `'{}'`
- `created_at` `timestamptz` default `now()`
- `updated_at` `timestamptz` default `now()`

### `habit_groups`

- `id` `text` primary key
- `name` `text`
- `description` `text`
- `created_by` `uuid`
- `created_by_name` `text`
- `created_by_email` `text`
- `member_ids` `text[]` default `'{}'`
- `member_count` `integer` default `1`
- `is_public` `boolean` default `false`
- `created_at` `timestamptz` default `now()`
- `updated_at` `timestamptz` default `now()`

### `habit_group_members`

- `id` `text` primary key
- `group_id` `text`
- `user_id` `uuid`
- `user_name` `text`
- `user_email` `text`
- `role` `text` default `'member'`
- `joined_at` `timestamptz` default `now()`

- The live habit-share dashboard and auth now read from Supabase.
- Legacy HR/KRA screens in this repo still contain Firebase-specific code and should be migrated in a second pass before removing Firebase dependencies completely.
