import { DateRangePicker } from "@/shared/components/custom/daterange-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import ReportPDF from "./report-pdf";
import { Button } from "@/shared/components/ui/button";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type OutputType = "pdf" | "csv" | undefined;

const schema = z.object({
  dateRange: z.object({
    to: z.date(),
    from: z.date(),
  }),
  outputType: z.string(),
});

const defaultValues = {
  dateRange: {
    to: undefined,
    from: undefined,
  } as DateRange,
  outputType: "pdf" as OutputType,
};

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    to: undefined,
    from: undefined,
  });
  const [outputType, setOutputType] = useState<OutputType>();

  const form = useForm({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const handleSave = form.handleSubmit((value) => {
    setDateRange(value.dateRange);
    setOutputType(value.outputType);
  });

  return (
    <div className="flex flex-wrap items-start md:flex-nowrap gap-6 w-full">
      <div className="min-w-[275px] w-full">
        <div className="mb-2 flex">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Sales Report
          </h3>
        </div>
        <form onSubmit={handleSave}>
          <div className="mt-3 p-4 grid border-input border-[1px] rounded-sm bg-white">
            <div className="mb-3">Pick Report Range</div>
            <div className="flex flex-wrap md:flex-nowrap w-full gap-2">
              <div className="w-full min-w-[150px]">
                <Controller
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => {
                    return (
                      <DateRangePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />
              </div>
              <div className="w-full min-w-[150px]">
                <Controller
                  control={form.control}
                  name="outputType"
                  render={({ field }) => {
                    return (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select output" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
              </div>
            </div>
            <Button className="mt-2" type="submit">
              Save
            </Button>
          </div>
        </form>

        <div className="mt-3">
          {outputType === "pdf" && <ReportPDF daterange={dateRange} />}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
