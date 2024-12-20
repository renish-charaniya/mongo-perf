type Actor = {
  id: number;
  login: string;
  gravatar_id: string;
  url: string;
  avatar_url: string;
};

type Repo = {
  id: number;
  name: string;
  url: string;
};

type Payload = {
  ref?: string;
  ref_type?: string;
  master_branch?: string;
  description: string;
  pusher_type?: string;
};

export type Event = {
  id: string;
  type: string;
  actor: Actor;
  repo: Repo;
  payload: Payload;
  public: boolean;
  created_at: Date;
};
