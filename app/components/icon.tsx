import { Link } from "react-router";
import ClipkitIcon from "../assets/icon.svg";

export function Logo() {
  return (
    <Link to={"/app"} className="block">
      <img src={ClipkitIcon} alt="Icon" className="h-10" />
    </Link>
  );
}
