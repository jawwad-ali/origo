import { SAMPLE_PACK } from "../constants";
import styles from "./journey-panel.module.css";
import { PackCarton } from "./pack-carton";
import { RouteTrack } from "./route-track";

/** Beside the auth forms: one pack, its journey through the supply chain, and the patient's verified scan. */
export const JourneyPanel = () => (
  <div className={styles.panel}>
    <p className={styles.eyebrow}>
      <span className={styles.eyebrowDot} aria-hidden="true" />
      Sample pack · {SAMPLE_PACK.id}
    </p>

    <div className="grid content-center gap-20">
      <PackCarton />
      <RouteTrack />
    </div>

    <div className={styles.headline}>
      <h2>Every pack, accounted for.</h2>
      <p>
        Manufacturers, distributors and pharmacies record each handover. Patients scan the pack and see where
        it has been.
      </p>
    </div>
  </div>
);
