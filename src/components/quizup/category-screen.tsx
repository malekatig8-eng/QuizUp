import { Link } from "@tanstack/react-router";
import { CodeXml, Calculator, Globe2, FlaskConical, ChevronRight, Sparkles } from "lucide-react";
import { Header } from "./header";
import { categories } from "@/lib/quiz";

const icons = [CodeXml, Calculator, Globe2, FlaskConical];
const descriptions = ["Test your coding knowledge", "Challenge your math skills", "Explore a variety of topics", "Discover the world of science"];
export function CategoryScreen() {
  return <><Header create /><main className="page-main screen-enter"><div className="page-heading"><h1>Choose a Quiz Type</h1><p>Select the type of quiz you want to create</p></div>
    <div className="category-grid">{categories.map((category, i) => { const Icon = icons[i]; return <Link key={category} to="/create-quiz" search={{ category }} className="category-card"><span className="category-icon">{Icon && <Icon />}</span><div><h2 className="category-title">{category}</h2><p className="category-description">{descriptions[i]}</p></div><ChevronRight className="category-chevron" /></Link>; })}</div>
    <p className="category-footer"><Sparkles size={15} />A little curiosity. A lot of possibilities.</p>
  </main></>;
}