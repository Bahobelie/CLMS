import Employee from './Employee';
import SystemConstant from '../../data/constants';

const EmergencyStaff = () => {
  return (
    <>
      <Employee
        params={{ type: SystemConstant.EmployeeType.EmergencyStuff }}
        subModel="EmergencyStaff"
      />
    </>
  );
};

export default EmergencyStaff;
