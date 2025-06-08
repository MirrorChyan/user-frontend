import { ProjectCardProps } from "@/components/ProjectCard";
import { SERVER_BACKEND } from "@/app/requests/misc";

export default async function ProjectsInfo(type_id?: string) {
  const resp = await fetch(`${SERVER_BACKEND}/api/misc/project${type_id ? `?type_id=${type_id}` : ""}`);
  const projects: Array<ProjectCardProps> = [];
  try {
    const { ec, data } = await resp.json();
    if (ec === 200) {
      Array.prototype.push.apply(projects, data);
    }
  } catch (e) {
    console.log(e);
  }

  return projects;
}
