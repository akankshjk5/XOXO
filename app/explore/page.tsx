import { redirect } from "next/navigation";

/** Mobile nav labels this "Explore" → /packages; keep /explore from 404ing. */
export default function ExplorePage() {
  redirect("/packages");
}
