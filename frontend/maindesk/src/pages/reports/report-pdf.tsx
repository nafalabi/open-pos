import { PDFViewer } from "@react-pdf/renderer";
import OrderReportTemplatePDF from "./template/orders-report-pdf";
import { DateRange } from "react-day-picker";
import { getOrderReportsMeta } from "../../api/reports";
import { format } from "date-fns";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

type ReportPDFProps = {
  daterange: DateRange;
};

const LazyRenderPDFViewer = ({
  datestart,
  dateend,
}: {
  datestart: Date;
  dateend: Date;
}) =>
  lazy(() => {
    return (async () => {
      const [res, err] = await getOrderReportsMeta({
        datestart: format(datestart, "yyyy-MM-dd"),
        dateend: format(dateend, "yyyy-MM-dd"),
      });
      if (err) {
        return {
          default: () => (
            <div className="text-center">
              Can't get meta data: {err.message}
            </div>
          ),
        };
      }

      const metadata = res.data;

      return {
        default: () => (
          <PDFViewer
            style={{
              height: "calc(100vh - 20px)",
              width: "100%",
            }}
            showToolbar={true}
          >
            <OrderReportTemplatePDF
              datestart={datestart}
              dateend={dateend}
              metadata={metadata}
            />
          </PDFViewer>
        ),
      };
    })();
  });

const ReportPDF = ({ daterange }: ReportPDFProps) => {
  if (daterange.to === undefined || daterange.from === undefined)
    return <div>Date range can't be null</div>;

  const Lazy = LazyRenderPDFViewer({
    dateend: daterange.to,
    datestart: daterange.from,
  });

  return (
    <Suspense
      fallback={
        <div className="flex justify-center h-20 items-center w-full">
          <Loader2 className="h-16 w-16 animate-spin border-foreground" />
        </div>
      }
    >
      <Lazy />
    </Suspense>
  );
};

export default ReportPDF;
