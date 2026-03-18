import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface ColumnDef<T> {
  key: string
  header: string
  headerClassName?: string
  cellClassName?: string
  render: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  emptyMessage?: string
  onRowClick?: (row: T) => void
  className?: string
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No data found",
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("bg-surface border border-border overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "text-[11px] font-semibold text-chalk-3 uppercase tracking-wider",
                  col.headerClassName
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="px-4 py-16 text-center text-chalk-3"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={rowKey(row)}
                className="border-border hover:bg-void-3 transition-colors"
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn("text-sm", col.cellClassName)}
                  >
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
