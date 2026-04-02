-- PromptShield durable lineage schema for the active local SQLite CLI runtime.
-- The current local contract stores request lineage directly in pluralized tables.
-- `workspace_id` and `api_route_id` remain denormalized on `request_events`.

create table if not exists request_events (
  id text primary key,
  workspace_id text not null,
  api_route_id text,
  request_id text not null,
  model_requested text not null,
  model_served text not null,
  input_tokens integer not null,
  output_tokens integer,
  estimated_cost_usd real not null,
  decision_kind text not null,
  created_at text not null
);

create table if not exists optimization_actions (
  id text primary key,
  request_event_id text not null references request_events(id),
  action_type text not null,
  before_value real not null,
  after_value real not null,
  reason text not null,
  created_at text not null
);

create table if not exists savings_records (
  id text primary key,
  request_event_id text not null references request_events(id),
  optimization_action_id text not null references optimization_actions(id),
  gross_cost_usd real not null,
  optimized_cost_usd real not null,
  realized_savings_usd real not null,
  source text not null,
  created_at text not null
);
