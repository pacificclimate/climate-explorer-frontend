import React, { forwardRef } from "react";
import {
  BsInfoCircleFill,
  BsList,
  BsUpload,
  BsDownload,
  BsArrowLeftRight,
  BsEyeFill,
  BsEyeSlashFill,
  BsCircleHalf,
} from "react-icons/bs";

const glyphs = {
  "info-sign": BsInfoCircleFill,
  "menu-hamburger": BsList,
  "open-file": BsUpload,
  "save-file": BsDownload,
  transfer: BsArrowLeftRight,
  "eye-open": BsEyeFill,
  "eye-close": BsEyeSlashFill,
  adjust: BsCircleHalf,
};

const Icon = forwardRef(function Icon(
  { glyph, className = "", ...props },
  ref,
) {
  const Glyph = glyphs[glyph];
  return (
    <span ref={ref} className={`pcic-icon ${className}`} {...props}>
      {Glyph && <Glyph aria-hidden="true" />}
    </span>
  );
});
export default Icon;
