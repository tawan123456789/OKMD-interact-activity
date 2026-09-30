import { Link } from "react-router-dom";
import { StateScreen } from "../components/StateScreen";

export function NotFound() {
  return (
    <StateScreen title="404" message="ไม่พบหน้าที่คุณต้องการ">
      <Link to="/" className="btn btn--primary">
        Back to Admin
      </Link>
    </StateScreen>
  );
}
