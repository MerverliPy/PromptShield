-- PromptShield durable schema
-- Primary lineage:
--   workspace -> api_route -> request_event -> optimization_action -> savings_record
-- Savings records also keep the parent request foreign key for direct request-level queries.
-- Future policy and billing tables can be added without changing this lineage.

create table workspace (
  id uuid primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table api_route (
  id uuid primary key,
  workspace_id uuid not null references workspace(id),
  route_key text not null,
  created_at timestamptz not null default now()
);

create table request_event (
  id uuid primary key,
  workspace_id uuid not null references workspace(id),
  api_route_id uuid references api_route(id),
  request_id text not null unique,
  model_requested text not null,
  model_served text not null,
  input_tokens integer not null,
  output_tokens integer,
  estimated_cost_usd numeric(12, 6) not null,
  decision_kind text not null,
  created_at timestamptz not null default now()
);

create table optimization_action (
  id uuid primary key,
  request_event_id uuid not null references request_event(id),
  action_type text not null,
  before_value integer not null,
  after_value integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table savings_record (
  id uuid primary key,
  request_event_id uuid not null references request_event(id),
  optimization_action_id uuid not null unique references optimization_action(id),
  gross_cost_usd numeric(12, 6) not null,
  optimized_cost_usd numeric(12, 6) not null,
  realized_savings_usd numeric(12, 6) not null,
  source text not null,
  created_at timestamptz not null default now()
);
