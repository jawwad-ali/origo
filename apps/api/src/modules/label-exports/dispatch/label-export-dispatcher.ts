/**
 * Starts building an export that was just recorded. Picked per deployment with LABEL_EXPORT_RUNNER:
 * hand it to the queue worker, or build it in this process after the response.
 */
export abstract class LabelExportDispatcher {
  abstract dispatch(exportId: string): Promise<void>;
}
