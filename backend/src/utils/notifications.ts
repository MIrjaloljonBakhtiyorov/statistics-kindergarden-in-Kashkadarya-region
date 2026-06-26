import { pool } from "../db/pool.js";

export type NotificationType = "application" | "team" | "sorting" | "result" | "monitoring" | "system";

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string | null;
  actionLabel?: string | null;
};

export async function createNotification(input: CreateNotificationInput) {
  await pool.query(
    `
      INSERT INTO notifications (
        user_id,
        type,
        title,
        body,
        action_url,
        action_label
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      input.userId,
      input.type,
      input.title,
      input.body,
      input.actionUrl ?? null,
      input.actionLabel ?? null
    ]
  );
}

