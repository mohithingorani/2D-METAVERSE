export function TextMessage({
  userId,
  selfUserId,
  text,
}: {
  userId: string;
  selfUserId: string;
  text: string;
}) {
  if (userId == selfUserId) {
    return (
      <div className="flex w-full justify-end">
        <div className="text-right bg-white  text-black  leading-tight py-1 px-2 rounded my-1">
          {text}
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex w-full justify-start">
        <div className="text-left bg-white  text-black  leading-tight py-1 px-2 rounded my-1">
          {text}
        </div>
      </div>
    );
  }
}
