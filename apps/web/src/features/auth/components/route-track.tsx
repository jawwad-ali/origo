import { ShieldCheck } from "lucide-react";
import { SAMPLE_ROUTE, SAMPLE_VERDICT } from "../constants";
import styles from "./journey-panel.module.css";

/** The pack's handovers, lit one by one, ending in the patient's verified scan. */
export const RouteTrack = () => (
  <div className={styles.journey}>
    <div className={styles.routeWrap}>
      <span className={styles.track} aria-hidden="true" />
      <span className={styles.fill} aria-hidden="true" />
      <ol className={styles.route} aria-label="Sample handovers">
        {SAMPLE_ROUTE.map((stop) => (
          <li key={stop.role} className={styles.stop}>
            <span className={styles.node} aria-hidden="true" />
            <span className={styles.role}>{stop.role}</span>
            <span className={styles.city}>
              {stop.city} · {stop.date}
            </span>
          </li>
        ))}
      </ol>
    </div>
    <span className={styles.verdict}>
      <ShieldCheck className="size-4" aria-hidden="true" />
      {SAMPLE_VERDICT}
    </span>
  </div>
);
