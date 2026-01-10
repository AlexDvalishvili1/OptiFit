import {Schema, model, models, type Model} from "mongoose";

type SmsCooldownDoc = {
    phone: string; // normalized phone
    ip: string;
    expiresAt: Date;
    createdAt: Date;
};

const schema = new Schema<SmsCooldownDoc>(
    {
        phone: {type: String, required: true, index: true},
        ip: {type: String, required: true, index: true},
        expiresAt: {type: Date, required: true},
        createdAt: {type: Date, default: () => new Date()},
    },
    {versionKey: false}
);

// TTL auto-delete
schema.index({expiresAt: 1}, {expireAfterSeconds: 0});

// prevent duplicates spam
schema.index({phone: 1, ip: 1}, {unique: true});

export const SmsCooldown: Model<SmsCooldownDoc> =
    (models.SmsCooldown as Model<SmsCooldownDoc>) ||
    model<SmsCooldownDoc>("SmsCooldown", schema);