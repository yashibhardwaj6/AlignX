from app.auth.security import hash_password
from app.models.models import CheckIn, CycleWindow, Escalation, Goal, GoalStatus, Notification, ProgressStatus, Role, UomType, User
from app.services.progress import calculate_progress


def seed_demo_data(db):
    demo_accounts = {
        "admin@alignx.com": "Avery HR",
        "manager@alignx.com": "Maya Singh",
        "employee@alignx.com": "Rohan Mehta",
    }
    existing_demo_users = db.query(User).filter(User.email.in_(demo_accounts.keys())).all()
    if existing_demo_users:
        for user in existing_demo_users:
            user.password = hash_password("AlignX@123")
        db.commit()
        return

    admin = User(name="Avery HR", email="admin@alignx.com", password=hash_password("AlignX@123"), role=Role.admin, department="People Operations")
    manager = User(name="Maya Singh", email="manager@alignx.com", password=hash_password("AlignX@123"), role=Role.manager, department="Revenue")
    employee = User(name="Rohan Mehta", email="employee@alignx.com", password=hash_password("AlignX@123"), role=Role.employee, department="Revenue")
    teammate = User(name="Elena Brooks", email="elena@alignx.com", password=hash_password("AlignX@123"), role=Role.employee, department="Product")
    db.add_all([admin, manager, employee, teammate])
    db.flush()
    employee.manager_id = manager.id
    teammate.manager_id = manager.id

    goals = [
        Goal(employee_id=employee.id, thrust_area="Revenue Growth", title="Expand enterprise pipeline", description="Build qualified pipeline from strategic accounts.", uom_type=UomType.numeric, target="40", weightage=30, status=GoalStatus.approved, approved=True, locked=True),
        Goal(employee_id=employee.id, thrust_area="Customer Success", title="Improve renewal readiness", description="Reduce at-risk renewals through proactive success plans.", uom_type=UomType.percentage, target="92", weightage=25, status=GoalStatus.approved, approved=True, locked=True),
        Goal(employee_id=employee.id, thrust_area="Operational Excellence", title="Launch QBR automation", description="Deliver automated QBR reporting by deadline.", uom_type=UomType.timeline, target="2026-09-30", weightage=20, status=GoalStatus.submitted),
        Goal(employee_id=employee.id, thrust_area="Quality", title="Zero compliance defects", description="Maintain zero critical control misses.", uom_type=UomType.zero_based, target="0", weightage=25, status=GoalStatus.approved, approved=True, locked=True),
        Goal(employee_id=teammate.id, thrust_area="Product Adoption", title="Increase active feature usage", description="Move core feature adoption in target accounts.", uom_type=UomType.percentage, target="78", weightage=40, status=GoalStatus.submitted),
        Goal(employee_id=teammate.id, thrust_area="Delivery", title="Reduce implementation cycle time", description="Lower average implementation days.", uom_type=UomType.numeric, target="25", weightage=30, status=GoalStatus.approved, approved=True, locked=True, direction="max"),
        Goal(employee_id=teammate.id, thrust_area="People", title="Mentor associate consultants", description="Run enablement sessions and playbook reviews.", uom_type=UomType.numeric, target="8", weightage=30, status=GoalStatus.returned, manager_comment="Clarify measurable outcomes."),
    ]
    db.add_all(goals)
    db.flush()

    for goal, quarter, planned, actual, status in [
        (goals[0], "Q1", "10", "12", ProgressStatus.on_track),
        (goals[0], "Q2", "20", "22", ProgressStatus.on_track),
        (goals[1], "Q1", "88", "84", ProgressStatus.on_track),
        (goals[3], "Q1", "0", "0", ProgressStatus.completed),
        (goals[5], "Q1", "28", "26", ProgressStatus.on_track),
        (goals[5], "Q2", "25", "24", ProgressStatus.completed),
    ]:
        db.add(CheckIn(goal_id=goal.id, quarter=quarter, planned_target=planned, actual_achievement=actual, progress_status=status, progress_percent=calculate_progress(goal.uom_type.value, goal.target, actual, goal.direction)))

    db.add_all([
        CycleWindow(name="Goal Setting", month_window="May", active=True),
        CycleWindow(name="Q1 Check-in", month_window="July", active=True),
        CycleWindow(name="Q2 Check-in", month_window="October", active=True),
        CycleWindow(name="Q3 Check-in", month_window="January", active=True),
        CycleWindow(name="Q4 / Annual", month_window="March-April", active=True),
        Notification(user_id=employee.id, title="Welcome to AlignX", message="Your FY goals are ready for review."),
        Notification(user_id=manager.id, title="Pending approvals", message="2 team goals are awaiting your review."),
        Escalation(employee_id=teammate.id, escalation_type="Approval delay", escalation_level="Manager", resolved=False),
    ])
    db.commit()
