export const isMultipleOfPi = (rotationAngle) => {
    // Round the rotation angle to one decimal place
    const roundedAngle = Math.round(rotationAngle * 10) / 10;
    // Check if the rounded angle is a multiple of π
    const multipleOfPi = Math.PI;
    // Tolerance to account for floating-point precision issues
    const tolerance = 0.1;
    return (
      Math.abs(roundedAngle % multipleOfPi) < tolerance ||
      Math.abs((roundedAngle % multipleOfPi) - multipleOfPi) < tolerance
    );
  };
