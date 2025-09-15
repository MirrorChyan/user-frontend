"use client";

import { Select, SelectItem } from "@heroui/react";
import { useEffect, useState } from "react";
import { SharedSelection } from "@heroui/system";

type PropsType = {
  onChange?: (value: string) => void;
};

export default function YearMonthPicker({ onChange }: PropsType) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = formatMonth(currentDate.getMonth() + 1); // 月份从0开始

  function formatMonth(month: number) {
    return month.toString().padStart(2, "0");
  }

  const startYear = 2025;
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
  const months = Array.from({ length: 12 }, (_, i) => formatMonth(i + 1));

  // 设置初始值为当前年月
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const handleYearChange = (set: SharedSelection) => {
    const year = String([...set][0]);
    setSelectedYear(year);
    if (selectedMonth) onChange?.(year + selectedMonth);
  };

  const handleMonthChange = (set: SharedSelection) => {
    const month = String([...set][0]);
    setSelectedMonth(month);
    if (selectedYear) onChange?.(selectedYear + month);
  };

  // 初始化时触发一次回调
  useEffect(() => {
    onChange?.(currentYear + currentMonth);
  }, []); // 空依赖数组确保只执行一次

  return (
    <div className="flex w-full overflow-hidden rounded-2xl">
      <Select
        onSelectionChange={handleYearChange}
        value={selectedYear}
        fullWidth
        label={"Year"}
        radius={"none"}
        defaultSelectedKeys={[currentYear.toString()]} // 设置默认选中
      >
        {years.map(year => (
          <SelectItem key={year} value={year} textValue={String(year)}>
            {year}
          </SelectItem>
        ))}
      </Select>
      <Select
        onSelectionChange={handleMonthChange}
        value={selectedMonth}
        fullWidth
        label={"Month"}
        radius={"none"}
        defaultSelectedKeys={[currentMonth]} // 设置默认选中
      >
        {months.map(month => (
          <SelectItem key={month} value={month} textValue={String(month)}>
            {month}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
