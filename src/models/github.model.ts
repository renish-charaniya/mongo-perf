import { Schema, Document, model } from 'mongoose';

// TypeScript Interface for Strong Typing
export interface IGithubEvent extends Document {
  id: string;
  type: string;
  actor: {
    id: number;
    login: string;
    gravatar_id: string;
    url: string;
    avatar_url: string;
  };
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: {
    ref?: string;
    ref_type?: string;
    master_branch?: string;
    description: string;
    pusher_type?: string;
  };
  public: boolean;
  created_at: Date;
}

// Mongoose Schema
const GithubEventSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  actor: {
    id: {
      type: Number,
      required: true,
    },
    login: {
      type: String,
      required: true,
    },
    gravatar_id: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      required: true,
    },
    avatar_url: {
      type: String,
      required: true,
    },
  },
  repo: {
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  payload: {
    ref: {
      type: String,
    },
    ref_type: {
      type: String,
    },
    master_branch: {
      type: String,
    },
    description: {
      type: String,
    },
    pusher_type: {
      type: String,
    },
  },
  public: {
    type: Boolean,
    required: true,
  },
  created_at: {
    type: Date,
    required: true,
  },
});

// Export the model
const GithubEvent = model<IGithubEvent>('GithubEvent', GithubEventSchema);
export default GithubEvent;
