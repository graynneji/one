import { Client } from "@/utils/client";
import { createClient } from "@supabase/supabase-js";

export interface ReadOptions {
  or?: string;
  order?: { column: string; ascending: boolean };
  range?: { from: number; to: number };
  count?: "exact" | "planned" | "estimated";
  lt?: { column: string; value: any };
  match?: Record<string, any>;
}
export class CrudAdapter {
  constructor(private client: Client) {}

  create<T>(table: string, payload: Partial<T>) {
    return this.client.supabase.from(table).insert(payload).select().single();
  }

  read(
    table: string,
    options?: { orderBy?: string; ascending?: boolean },
    column: string = "*"
  ) {
    let query = this.client.supabase.from(table).select(column);

    if (options?.orderBy) {
      query = query.order(options.orderBy, {
        ascending: options.ascending ?? true,
      });
    }

    return query;
  }

  async readById<T>(
    table: string,
    filters: Partial<T> = {},
    column: string = "*",
    options: ReadOptions = {}
  ) {
    let query = this.client.supabase
      .from(table)
      .select(column, { count: "exact" });

    for (const key in filters) {
      query = query.eq(key, filters[key] as any);
    }
    if (options.or) query = query.or(options.or);
    if (options.order)
      query = query.order(options.order.column, {
        ascending: options.order.ascending,
      });
    if (options.range)
      query = query.range(options.range.from, options.range.to);
    if (options.lt) query = query.lt(options.lt.column, options.lt.value);
    if (options.match) query = query.match(options.match);
    return await query;
  }

  update<T>(
    table: string,
    payload: Partial<T>,
    column: string = "id",
    id?: string | number
  ) {
    if (table === "auth") {
      return this.client.supabase.auth.updateUser(payload);
    } else {
      return this.client.supabase
        .from(table)
        .update(payload)
        .eq(column, id)
        .select();
    }
  }

  delete(table: string, id: string | number) {
    return this.client.supabase.from(table).delete().eq("id", id);
  }

  rpc<T>(fn: string, params?: Partial<T>) {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    return supabase.rpc(fn, params);
    // return this.client.supabase.rpc(fn, params);
  }

  async markMessagesRead(table: string, senderId: string, receiverId: string) {
    return this.client.supabase
      .from(table)
      .update({ is_read: true })
      .eq("sender_id", receiverId)
      .eq("reciever_id", senderId)
      .eq("is_read", false);
  }
}
