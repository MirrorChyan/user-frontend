import { Table, TableBody, TableColumn, TableHeader, TableRow, TableCell } from "@heroui/react";
import { RevenueType } from "@/app/[locale]/dashboard/page";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { groupBy } from "lodash";

type PropsType = {
  listData: RevenueType[]
  date: string
}

type DataType = {
  amount: string
  count: number
  date: string
}

const UpDownIcon = () => {
  return (
    <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="18"
      height="18">
      <path
        d="M158.165333 392.832a42.666667 42.666667 0 0 1-60.330666-60.330667L238.336 192a85.333333 85.333333 0 0 1 120.661333 0l140.501334 140.501333a42.666667 42.666667 0 0 1-60.330667 60.330667L341.333333 294.997333V810.666667a42.666667 42.666667 0 1 1-85.333333 0V294.997333L158.165333 392.832z"
        fill="#000000"></path>
      <path
        d="M768 213.333333a42.666667 42.666667 0 1 0-85.333333 0v515.669334l-97.834667-97.834667a42.666667 42.666667 0 0 0-60.330667 60.330667l140.501334 140.501333a85.333333 85.333333 0 0 0 120.661333 0l140.501333-140.501333a42.666667 42.666667 0 0 0-60.330666-60.330667L768 729.002667V213.333333z"
        fill="#9F9F9F"></path>
    </svg>
  );
};

export default function SalesList({ listData, date }: PropsType) {
  const t = useTranslations("Dashboard");
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const generateDateRange = () => {
    const tarngetYear = Number(date.slice(0, 4));
    const tarngetMonth = Number(date.slice(5));
    const month = [31,
      tarngetYear % 4 === 0 && tarngetYear % 100 !== 0 || tarngetYear % 400 === 0 ? 29 : 28,
      31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const currentMonth = new Date().getMonth() + 1;

    const dates: number[] = [];
    const lastDay = currentMonth === tarngetMonth ? new Date().getDate() : month[tarngetMonth - 1];

    for (let i = 1; i <= lastDay; i++) {
      dates.push(i);
    }
    return dates;
  };

  // 初始化日期范围
  const resolveData = useMemo(() => {
    const groupedData = groupBy(
      listData.map(item => ({ ...item, activated_at: `${date.slice(5)}-${new Date(item.activated_at).getDate()}` })),
      (item) => item.activated_at
    );
    const dateMap = new Map<string, DataType>();
    const dateRange = generateDateRange();

    dateRange.forEach((day) => {
      const key = `${date.slice(5)}-${day}`;

      if (groupedData[key] === undefined) {
        dateMap.set(key, {
          count: 0,
          amount: "0.00",
          date: key,
        });
      } else {
        const count = Number(groupedData[key].reduce((acc, cur) => acc + Number(cur.buy_count), 0));
        const amount = groupedData[key].reduce((acc, cur) => acc + Number(cur.amount), 0).toFixed(2);
        dateMap.set(key, {
          count,
          amount,
          date: key,
        });
      }
    });
    return Array.from(dateMap.values());
  }, [listData]);

  const processedData = useMemo(() => {
    return [...resolveData].sort((a, b) => {
      if (sortBy === "date") {
        return Number(sortOrder === "asc" ? Number(new Date(a.date)) - Number(new Date(b.date)) :
          Number(new Date(b.date)) - Number(new Date(a.date)));
      } else if (sortBy === "amount") {
        return (sortOrder === "asc" ? Number(a.amount) - Number(b.amount) : Number(b.amount) - Number(a.amount));
      } else {
        return (sortOrder === "asc" ? a.count - b.count : b.count - a.count);
      }
    });
  }, [resolveData, sortBy, sortOrder]);


  const columns = [
    {
      key: "date",
      label: t("list.date"),
    },
    {
      key: "count",
      label: t("list.count")
    },
    {
      key: "amount",
      label: t("list.amount")
    }
  ];

  return (
    <>
      <Table
        isVirtualized
        isHeaderSticky
        className="h-full p-0 overflow-y-scroll scrollbar-hide"
      >
        <TableHeader columns={columns} className="relative">
          {(column) => <TableColumn key={column.key} className="text-center relative">
            {column.label}
            <div onClick={() => {
              setSortBy(column.key);
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            }}
              className="absolute right-0 top-1 mr-2 mt-2 cursor-pointer hover:text-gray-400 hover:shadow-sm hover:rotate-180 transition"
            ><UpDownIcon /></div>
          </TableColumn>}
        </TableHeader>
        <TableBody items={processedData}>
          {(item) => (
            <TableRow key={String(item.date)} className="hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white">
              <TableCell className="text-center">{item.date}</TableCell>
              <TableCell className="text-center">{item.count}</TableCell>
              <TableCell className="text-right pr-6">{item.amount}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
