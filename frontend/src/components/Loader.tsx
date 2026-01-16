import { ClipLoader } from "react-spinners";

export function Loader({ size }: { size:number }) {
  return (
    <ClipLoader
      color={"ffffff"}
      cssOverride={{
        color: "black",
      }}
      size={size}
      aria-label="Loading Spinner"
      data-testid="loader"
    />
  );
}
