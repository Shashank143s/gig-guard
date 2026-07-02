// Only the provinces used by the app are included here.
// BC has a separate gig-worker floor and mileage reimbursement.
export const PROVINCES = [
  { code: "ON", name: "Ontario", minWage: 17.6 },
  { code: "BC", name: "British Columbia", minWage: 17.85, gigWage: 21.89 },
];

export const BC_MILEAGE_RATE = 0.35;
  
  export const getProvince = (code) =>
    PROVINCES.find((p) => p.code === code) || PROVINCES.find((p) => p.code === "ON");
  
  // Floor wage to enforce for this province (gig-specific rate when available).
export const getFloorWage = (province) =>
  province.gigWage && province.gigWage > province.minWage
    ? province.gigWage
    : province.minWage;
  
/**
 * Calculate guaranteed minimum earnings and any pay adjustment.
 * adjustment = wage top-up + BC mileage reimbursement
 * total = base pay + adjustment + optional tips
 */
export function calculateAdjustment({
  basePay,
  activeHours,
  provinceCode,
  mileageKm = 0,
  tips = 0,
  includeTips = false,
}) {
  const province = getProvince(provinceCode);
  const floorWage = getFloorWage(province);
  const bp = Number(basePay) || 0;
  const hrs = Number(activeHours) || 0;
  const km = Math.max(0, Number(mileageKm) || 0);
  const tipValue = Math.max(0, Number(tips) || 0);
  const guaranteed = +(floorWage * hrs).toFixed(2);
  const wageAdjustment = +Math.max(0, guaranteed - bp).toFixed(2);
  const mileageAdjustment = province.code === "BC" ? +(km * BC_MILEAGE_RATE).toFixed(2) : 0;
  const tipsAdjustment = includeTips ? +tipValue.toFixed(2) : 0;
  const adjustment = +(wageAdjustment + mileageAdjustment).toFixed(2);
  const total = +(bp + adjustment + tipsAdjustment).toFixed(2);
  const baseRate = hrs > 0 ? +(bp / hrs).toFixed(2) : 0;
  const effectiveRate = hrs > 0 ? +(total / hrs).toFixed(2) : 0;
  return {
    province,
    minWage: floorWage, // kept name for backward compatibility in UI
    floorWage,
    baseRate,
    basePay: +bp.toFixed(2),
    activeHours: +hrs.toFixed(2),
    mileageKm: +km.toFixed(2),
    mileageRate: province.code === "BC" ? BC_MILEAGE_RATE : 0,
    tips: +tipValue.toFixed(2),
    includeTips: !!includeTips,
    wageAdjustment,
    mileageAdjustment,
    tipsAdjustment,
    guaranteed,
    adjustment,
    total,
    effectiveRate,
    hitsFloor: wageAdjustment > 0,
    usesGigRate: !!(province.gigWage && province.gigWage > province.minWage),
  };
}
  
  /**
   * Project earnings for extra hours added.
   * User keeps earning at their current per-active-hour base rate.
   */
export function projectEarnings({
  basePay,
  activeHours,
  extraHours,
  provinceCode,
  mileageKm = 0,
  tips = 0,
  includeTips = false,
}) {
  const bp = Number(basePay) || 0;
  const hrs = Number(activeHours) || 0;
  const extra = Math.max(0, Number(extraHours) || 0);
  const baseRate = hrs > 0 ? bp / hrs : 0;
  const projectedBasePay = +(bp + baseRate * extra).toFixed(2);
  const projectedHours = +(hrs + extra).toFixed(2);
  return calculateAdjustment({
    basePay: projectedBasePay,
    activeHours: projectedHours,
    provinceCode,
    mileageKm,
    tips,
    includeTips,
  });
}
  
  // Convert hours + minutes pair to decimal hours (and back).
  export const toDecimalHours = (h, m) =>
    Math.max(0, (Number(h) || 0) + (Number(m) || 0) / 60);
  
  export const fromDecimalHours = (dec) => {
    const total = Math.max(0, Number(dec) || 0);
    const h = Math.floor(total);
    const m = Math.round((total - h) * 60);
    if (m === 60) return { h: h + 1, m: 0 };
    return { h, m };
  };
  
