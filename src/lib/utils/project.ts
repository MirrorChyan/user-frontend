import type { ProjectCardProps } from "@/components/ProjectCard";

export const GAME_TOOLS_TYPE_ID = "GameTools";
export const DEPENDENCIES_TYPE_ID = "Dependencies";

/** 项目页展示的项目：应用项目在前，依赖项目在后，其他类型不展示 */
export function listedProjects(projects: ProjectCardProps[]): ProjectCardProps[] {
  return [
    ...projects.filter(project => project.type_id === GAME_TOOLS_TYPE_ID),
    ...projects.filter(project => project.type_id === DEPENDENCIES_TYPE_ID),
  ];
}

/** 对外展示的接入数量，向下取整到 5 的倍数，配合文案里的 "N+" 使用 */
export function displayAppCount(total: number): number {
  return total - (total % 5);
}
