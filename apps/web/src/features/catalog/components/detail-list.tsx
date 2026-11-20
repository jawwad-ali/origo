import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DetailRow {
  label: string;
  value: React.ReactNode;
}

/** A titled card of label/value rows, used for product and batch facts. */
export const DetailList = ({ title, rows }: { title: string; rows: DetailRow[] }) => (
  <Card className="gap-2">
    <CardHeader>
      <CardTitle className="text-base">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <dl className="divide-y">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[7.5rem_1fr] gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="min-w-0 break-words">{row.value}</dd>
          </div>
        ))}
      </dl>
    </CardContent>
  </Card>
);
