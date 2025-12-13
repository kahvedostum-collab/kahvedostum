import PropTypes from "prop-types";
import { Badge } from "@/components/shacdn/badge";

const RequestSection = ({
  icon,
  iconGradient,
  title,
  description,
  count,
  badgeClassName,
  children,
}) => {
  return (
    <div className="bg-white/95 dark:bg-zinc-900/95 rounded-2xl border-2 border-amber-200 dark:border-amber-900/50 shadow-lg p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`h-10 w-10 rounded-lg bg-linear-to-r ${iconGradient} flex items-center justify-center shadow-md`}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
            {title}
          </h3>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {description}
          </p>
        </div>
        {count > 0 && (
          <Badge className={`ml-auto ${badgeClassName}`}>{count}</Badge>
        )}
      </div>
      {children}
    </div>
  );
};

RequestSection.propTypes = {
  icon: PropTypes.node.isRequired,
  iconGradient: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  count: PropTypes.number,
  badgeClassName: PropTypes.string,
  children: PropTypes.node.isRequired,
};

RequestSection.defaultProps = {
  count: 0,
  badgeClassName: "bg-amber-500 text-white",
};

export default RequestSection;
