"use client";

import { Select, SelectItem } from "@heroui/react";
import { useEffect, useState, useRef } from "react";
import { SharedSelection } from "@heroui/system";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const START_YEAR = 2025;

type PropsType = {
  onChange?: (value: string) => void;
  initialYearMonth?: string; // YYYYMM
  showArrow?: boolean; // 是否显示左右箭头
};

export default function YearMonthPicker({ onChange, initialYearMonth, showArrow }: PropsType) {
  const StrYear = (i: number | string) => String(i);
  const StrMonth = (i: number | string) => String(i).padStart(2, "0");

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 月份从0开始

  const allYears = Array(currentYear - START_YEAR + 1)
    .fill(0)
    .map((_, i) => StrYear(START_YEAR + i));
  const allMonths = Array(12)
    .fill(0)
    .map((_, i) => StrMonth(i + 1));

  // 解析初始值
  const getInitialYearMonth = () => {
    if (initialYearMonth && initialYearMonth.length === 6) {
      const year = initialYearMonth.substring(0, 4);
      const month = initialYearMonth.substring(4, 6);
      if (allYears.includes(year) && allMonths.includes(month)) {
        return { year, month };
      }
    }
    return { year: StrYear(currentYear), month: StrMonth(currentMonth) };
  };
  const { year: initialYearValue, month: initialMonthValue } = getInitialYearMonth();

  const [selectedYear, setSelectedYear] = useState(initialYearValue);
  const [selectedMonth, setSelectedMonth] = useState(initialMonthValue);

  // 缓存 onChange 回调
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // 监听输入变化
  const handleYearChange = (set: SharedSelection) => {
    const year = StrYear([...set][0]);
    setSelectedYear(year);
    if (selectedMonth) onChangeRef.current?.(year + selectedMonth);
  };

  const handleMonthChange = (set: SharedSelection) => {
    const month = StrMonth([...set][0]);
    setSelectedMonth(month);
    if (selectedYear) onChangeRef.current?.(selectedYear + month);
  };

  // 在 selectedYear 和 selectedMonth 改变时触发回调
  useEffect(() => {
    if (selectedYear && selectedMonth) {
      onChangeRef.current?.(selectedYear + selectedMonth);
    }
  }, [selectedYear, selectedMonth]);

  // 当 initialYearMonth 改变时，同步更新选中值
  useEffect(() => {
    if (initialYearMonth && initialYearMonth.length === 6) {
      const year = initialYearMonth.substring(0, 4);
      const month = initialYearMonth.substring(4, 6);
      if (allYears.includes(year) && allMonths.includes(month)) {
        setSelectedYear(year);
        setSelectedMonth(month);
      }
    }
  }, [initialYearMonth, allYears, allMonths]);

  // 截断未来的月份列表
  const getMonthsForYear = (year: string) => {
    if (parseInt(year) === currentYear) {
      return allMonths.slice(0, currentDate.getMonth() + 1);
    }
    return allMonths;
  };

  // 切换到上一个月
  const goPrevMonth = () => {
    let year = parseInt(selectedYear);
    let month = parseInt(selectedMonth);
    if (month === 1) {
      if (year > START_YEAR) {
        year -= 1;
        month = 12;
      } else {
        return; // 已到最小月
      }
    } else {
      month -= 1;
    }
    const newYear = StrYear(year);
    const newMonth = StrMonth(month);
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
    onChange?.(newYear + newMonth);
  };

  // 切换到下一个月
  const goNextMonth = () => {
    let year = parseInt(selectedYear);
    let month = parseInt(selectedMonth);
    const isCurrentYear = year === currentYear;
    const maxMonth = isCurrentYear ? currentDate.getMonth() + 1 : 12;
    if (month === maxMonth) {
      if (!isCurrentYear && year < currentYear) {
        year += 1;
        month = 1;
      } else {
        return; // 已到最大月
      }
    } else {
      month += 1;
    }
    if (year > currentYear || (year === currentYear && month > currentDate.getMonth() + 1)) {
      return; // 不能超过当前年月
    }
    const newYear = StrYear(year);
    const newMonth = StrMonth(month);
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
    onChange?.(newYear + newMonth);
  };

  // 判断是否可切换
  const isMinMonth = selectedYear === StrYear(START_YEAR) && selectedMonth === "01";
  const isMaxMonth =
    selectedYear === StrYear(currentYear) && selectedMonth === StrMonth(currentMonth);

  return (
    <div className="flex w-full items-center overflow-hidden rounded-2xl">
      {showArrow && (
        <button
          onClick={goPrevMonth}
          disabled={isMinMonth}
          className={`mx-2 rounded-full border border-transparent p-2 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-neutral-800`}
          aria-label="<"
        >
          <ChevronLeftIcon className="h-6 w-6 text-gray-500" />
        </button>
      )}
      <div className="flex w-full items-center overflow-hidden rounded-2xl">
        <Select
          onSelectionChange={handleYearChange}
          selectedKeys={[selectedYear]}
          fullWidth
          label={"Year"}
          radius={"none"}
        >
          {allYears.map(year => (
            <SelectItem key={year} value={year} textValue={year}>
              {year}
            </SelectItem>
          ))}
        </Select>
        <Select
          onSelectionChange={handleMonthChange}
          selectedKeys={[selectedMonth]}
          fullWidth
          label={"Month"}
          radius={"none"}
        >
          {getMonthsForYear(selectedYear).map(month => (
            <SelectItem key={month} value={month} textValue={month}>
              {month}
            </SelectItem>
          ))}
        </Select>
      </div>
      {showArrow && (
        <button
          onClick={goNextMonth}
          disabled={isMaxMonth}
          className={`mx-2 rounded-full border border-transparent p-2 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-neutral-800`}
          aria-label=">"
        >
          <ChevronRightIcon className="h-6 w-6 text-gray-500" />
        </button>
      )}
    </div>
  );
}
