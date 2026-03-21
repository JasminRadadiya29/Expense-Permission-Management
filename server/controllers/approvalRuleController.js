import ApprovalRule from '../models/ApprovalRule.js';

export const getApprovalRules = async (req, res) => {
  try {
    const rules = await ApprovalRule.find({ company: req.companyId })
      .populate('steps.approvers', 'name email role')
      .populate('steps.specificApprovers', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ rules });
  } catch (error) {
    console.error('Get approval rules error:', error);
    res.status(500).json({ error: 'Error fetching approval rules' });
  }
};

export const createApprovalRule = async (req, res) => {
  try {
    const { name, steps } = req.body;

    await ApprovalRule.updateMany(
      { company: req.companyId },
      { isActive: false }
    );

    const rule = await ApprovalRule.create({
      company: req.companyId,
      name,
      steps,
      isActive: true
    });

    const populatedRule = await ApprovalRule.findById(rule._id)
      .populate('steps.approvers', 'name email role')
      .populate('steps.specificApprovers', 'name email role');

    res.status(201).json({ rule: populatedRule });
  } catch (error) {
    console.error('Create approval rule error:', error);
    res.status(500).json({ error: 'Error creating approval rule' });
  }
};

export const updateApprovalRule = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const { name, steps, isActive } = req.body;

    const rule = await ApprovalRule.findOne({ _id: ruleId, company: req.companyId });
    if (!rule) {
      return res.status(404).json({ error: 'Approval rule not found' });
    }

    if (isActive) {
      await ApprovalRule.updateMany(
        { company: req.companyId, _id: { $ne: ruleId } },
        { isActive: false }
      );
    }

    if (name) rule.name = name;
    if (steps) rule.steps = steps;
    if (isActive !== undefined) rule.isActive = isActive;

    await rule.save();

    const updatedRule = await ApprovalRule.findById(rule._id)
      .populate('steps.approvers', 'name email role')
      .populate('steps.specificApprovers', 'name email role');

    res.json({ rule: updatedRule });
  } catch (error) {
    console.error('Update approval rule error:', error);
    res.status(500).json({ error: 'Error updating approval rule' });
  }
};

export const deleteApprovalRule = async (req, res) => {
  try {
    const { ruleId } = req.params;

    const rule = await ApprovalRule.findOneAndDelete({ _id: ruleId, company: req.companyId });
    if (!rule) {
      return res.status(404).json({ error: 'Approval rule not found' });
    }

    res.json({ message: 'Approval rule deleted successfully' });
  } catch (error) {
    console.error('Delete approval rule error:', error);
    res.status(500).json({ error: 'Error deleting approval rule' });
  }
};