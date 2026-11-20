import { type BatchDetailDto, type LabelPreviewDto } from "@origo/shared";
import { qrSvg } from "@/lib/qr/qr-svg";

interface LabelPreviewProps {
  batch: BatchDetailDto;
  preview: LabelPreviewDto;
  maker: string;
}

/**
 * The first pack's label at its printed proportions (63.5 x 38.1 mm), with the real signed QR.
 * Scanning it opens the verification URL that will be printed on the pack.
 */
export const LabelPreview = async ({ batch, preview, maker }: LabelPreviewProps) => {
  const qr = await qrSvg(preview.verifyUrl);

  return (
    <figure className="space-y-2">
      <div
        className="flex aspect-[63.5/38.1] w-full max-w-sm items-center gap-[4%] rounded-md border bg-white px-[4%] text-[#0f1d24] shadow-sm"
        role="img"
        aria-label={`Label preview for pack ${preview.publicId}`}
      >
        {/* QR takes 27 of the label's 63.5 mm, as on the printed sheet. */}
        {/* Generated on the server from the API's signed URL; contains no user-entered markup. */}
        <div
          className="aspect-square w-[42.5%] shrink-0 [&_svg]:block [&_svg]:size-full"
          dangerouslySetInnerHTML={{ __html: qr }}
        />
        <div className="flex aspect-square min-w-0 flex-1 flex-col justify-between py-[1%]">
          <div className="min-w-0">
            <p className="truncate text-[0.55rem] font-semibold uppercase tracking-wider text-[#155e75]">
              {maker}
            </p>
            <p className="truncate text-sm font-semibold leading-tight">{batch.product.name}</p>
            <p className="truncate text-[0.7rem]">
              {batch.product.strength} · {batch.product.packSize}
            </p>
          </div>
          <div className="min-w-0 font-mono text-[0.6rem] leading-snug text-[#5a6a72]">
            <p className="truncate">BATCH {batch.batchNumber}</p>
            <p>EXP&nbsp;&nbsp;&nbsp;{batch.expiresOn.slice(0, 7)}</p>
            <p className="mt-1 truncate text-[0.68rem] font-semibold text-[#0f1d24]">{preview.publicId}</p>
          </div>
        </div>
      </div>
      <figcaption className="text-muted-foreground text-xs">
        Actual size on A4 21-up label sheets (63.5 × 38.1 mm). Scan the code to test it.
      </figcaption>
    </figure>
  );
};
