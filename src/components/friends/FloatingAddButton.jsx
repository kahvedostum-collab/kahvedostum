import PropTypes from "prop-types";
import { Plus } from "lucide-react";
import { Button } from "@/components/shacdn/button";

const FloatingAddButton = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="lg:hidden fixed bottom-6 right-6 h-12 w-12 md:h-14 md:w-14 rounded-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
      size="icon"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
};

FloatingAddButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default FloatingAddButton;
