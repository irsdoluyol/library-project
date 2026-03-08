import skeletonStyles from "./Skeleton.module.css";
import shelfStyles from "../../styles/pages/catalog/Shelf.module.css";
import pageStyles from "../../styles/common/Page.module.css";

function Skeleton({ className = "", width, height }) {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`${skeletonStyles.skeleton} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

export function BookCardSkeleton() {
  return (
    <div className={`${shelfStyles.book} ${skeletonStyles.bookSkeleton}`}>
      <Skeleton height={20} className={skeletonStyles.skeletonTitle} />
      <Skeleton height={14} width="60%" className={skeletonStyles.skeletonAuthor} />
      <Skeleton height={36} width={80} className={skeletonStyles.skeletonButton} />
    </div>
  );
}

export function BookListSkeleton({ count = 4 }) {
  return (
    <div className={shelfStyles.list}>
      {Array.from({ length: count }, (_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <li className={`${pageStyles.listItem} ${skeletonStyles.listItemSkeleton}`}>
      <Skeleton height={18} width="70%" />
      <Skeleton height={14} width="40%" />
      <div className={skeletonStyles.listActions}>
        <Skeleton height={36} width={80} />
        <Skeleton height={36} width={90} />
      </div>
    </li>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <ul className={pageStyles.list}>
      {Array.from({ length: count }, (_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </ul>
  );
}

export default Skeleton;
