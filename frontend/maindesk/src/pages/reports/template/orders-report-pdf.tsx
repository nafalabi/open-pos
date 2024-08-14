import { OrderReportsMeta } from "@/maindesk/src/api/reports";
import { currency } from "@/maindesk/src/utils/currency";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  type Styles,
} from "@react-pdf/renderer";
import { format } from "date-fns";

type Style = Styles[string];

Font.register({
  family: "Oswald",
  src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
});

const styles = StyleSheet.create({
  page: {
    paddingBottom: 65,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    fontFamily: "Oswald",
  },
  caption: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Oswald",
    marginBottom: 6,
  },
  pageNumber: {
    position: "absolute",
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
  container: {
    fontSize: 10,
    marginTop: 20,
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: "row",
  },
  marginBottom: {
    marginBottom: 12,
  },
  overviewLabel: {
    minWidth: 150,
  },
});

const columns = [
  {
    label: "No",
    key: "no",
    width: 30,
  },
  {
    label: "Order number",
    key: "order_number",
  },
  {
    label: "Recipient",
    key: "recipient",
  },
  {
    label: "Status",
    key: "status",
    width: 60,
  },
  {
    label: "Date",
    key: "created_at",
    width: 85,
    align: "center",
  },
  {
    label: "Num of items",
    key: "num_of_items",
    width: 50,
    align: "center",
  },
  {
    label: "Total",
    key: "total",
    width: 90,
    align: "right",
  },
];

type OrderReportTemplatePDFProps = {
  datestart: Date;
  dateend: Date;
  metadata: OrderReportsMeta;
};

const OrderReportTemplatePDF = ({
  metadata,
  datestart,
  dateend,
}: OrderReportTemplatePDFProps) => {
  return (
    <Document title="Order Report">
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Sales Report</Text>
        <Text style={styles.caption}>
          {format(datestart, "yyyy-MM-dd")} - {format(dateend, "yyyy-MM-dd")}
        </Text>

        <View style={styles.container}>
          <Text style={styles.subtitle}>Overview</Text>
          <View style={styles.row}>
            <Text style={styles.overviewLabel}>Total Orders</Text>
            <Text>: {metadata.total_orders}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.overviewLabel}>Total Customers (Unique)</Text>
            <Text>: {metadata.unique_customers}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.overviewLabel}>Revenue</Text>
            <Text>: {currency(metadata.total_revenue)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.overviewLabel}>Top Product</Text>
            <Text>: {metadata.top_product}</Text>
          </View>
        </View>

        <View style={styles.container}>
          <Text style={styles.subtitle}>Order List</Text>

          <View
            style={{
              flexDirection: "row",
              borderRightWidth: 1,
              borderBottomWidth: 1,
            }}
          >
            {columns.map(({ label, width, align }, index) => (
              <View
                style={{
                  borderTopWidth: 1,
                  borderLeftWidth: 1,
                  padding: 3,
                  width: width ? "" : "100%",
                  minWidth: width,
                  maxWidth: width,
                  textAlign: (align as Style["textAlign"]) ?? "left",
                }}
                key={index}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                  }}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>

          {metadata.orders.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={{
                flexDirection: "row",
                borderRightWidth: 1,
                borderBottomWidth: 1,
              }}
            >
              {columns.map(({ key, width, align }, colIndex) => {
                let value = String(
                  (row as unknown as Record<string, unknown>)[key] ?? "",
                );
                if (key === "no") {
                  value = String(rowIndex + 1);
                } else if (key === "order_number") {
                  value = value.replace("ORDER/", "");
                  value = value.replace("/", "/\r\n");
                } else if (key === "created_at") {
                  value = format(new Date(value as string), "dd MMM yy, HH:mm");
                } else if (key === "num_of_items") {
                  value = String(row?.items?.length ?? "");
                } else if (key === "total") {
                  value = currency(Number(value));
                }

                return (
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderLeftWidth: 1,
                      padding: 3,
                      width: width ? "" : "100%",
                      minWidth: width,
                      maxWidth: width,
                      textAlign: (align as Style["textAlign"]) ?? "left",
                    }}
                    key={colIndex}
                  >
                    <Text
                      style={{
                        fontWeight: "normal",
                      }}
                    >
                      {value}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default OrderReportTemplatePDF;
