import Employee from './Employee';
import SystemConstant from '../../data/constants';

const SenoGrapher = () => {
  return (
    <>
      <Employee
        params={{ type: SystemConstant.EmployeeType.SeniorPharmacist }}
        subModel="Senographer"
      />
    </>
  );
};

export default SenoGrapher;
