import { SAMPLE_PACK } from "../constants";
import { qrSvg } from "@/lib/qr/qr-svg";
import styles from "./journey-panel.module.css";

/** A medicine carton drawn in CSS 3D, with a real, scannable QR code for the sample pack. */
export const PackCarton = async () => {
  const qr = await qrSvg(SAMPLE_PACK.verifyUrl);

  return (
    <div className={styles.stage}>
      <div
        className={styles.carton}
        role="img"
        aria-label={`Sample pack ${SAMPLE_PACK.id}: ${SAMPLE_PACK.drug} ${SAMPLE_PACK.strength}`}
      >
        <div className={`${styles.face} ${styles.top}`} />
        <div className={`${styles.face} ${styles.side}`}>
          <span className={styles.sideText}>{SAMPLE_PACK.storage}</span>
        </div>
        <div className={`${styles.face} ${styles.front}`}>
          <div className={styles.label}>
            <span className={styles.maker}>
              <span className={styles.makerBar} />
              {SAMPLE_PACK.maker}
            </span>
            <span className={styles.drug}>{SAMPLE_PACK.drug}</span>
            <span className={styles.strength}>{SAMPLE_PACK.strength}</span>
            <span className={styles.form}>{SAMPLE_PACK.form}</span>
            <span className={styles.print}>
              <span>
                BATCH <b>{SAMPLE_PACK.batch}</b>
              </span>
              <span>
                EXP <b>{SAMPLE_PACK.expiry}</b>
              </span>
            </span>
          </div>
          <div className={styles.qrBlock}>
            <div className={styles.qr}>
              {/* Generated on the server from a constant URL; no user input reaches this markup. */}
              <div dangerouslySetInnerHTML={{ __html: qr }} />
              <span className={styles.beam} />
            </div>
            <span className={styles.qrId}>{SAMPLE_PACK.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
