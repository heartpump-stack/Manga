/**
 * `strategy.risk` is a nested namespace with 6 setter functions that
 * configure pre-trade risk rules. Each call mutates `context.strategy.risk_rules`;
 * the actual blocking is performed by `checkRiskRules()` in utils.ts,
 * invoked before each entry fills.
 *
 * Pine signatures:
 *   strategy.risk.allow_entry_in(value)                         → void
 *   strategy.risk.max_cons_loss_days(count, alert_message)      → void
 *   strategy.risk.max_drawdown(value, type, alert_message)      → void
 *   strategy.risk.max_intraday_filled_orders(count, alert_message) → void
 *   strategy.risk.max_intraday_loss(value, type, alert_message) → void
 *   strategy.risk.max_position_size(contracts)                  → void
 */
export declare function risk(context: any): {
    allow_entry_in: (value: "long" | "short" | "all") => void;
    max_cons_loss_days: (count: number, alert_message?: string) => void;
    max_drawdown: (value: number, type: "cash" | "percent_of_equity", _alert_message?: string) => void;
    max_intraday_filled_orders: (count: number, alert_message?: string) => void;
    max_intraday_loss: (value: number, type: "cash" | "percent_of_equity", _alert_message?: string) => void;
    max_position_size: (contracts: number) => void;
};
