# Marketplace Listing Copy — Task Finisher with Grok (Free)

## One-Line Summary
Closes the finish barrier. When the work is done but nothing has been shipped, this skill gives you the exact commands needed to commit, push, deploy, or publish — nothing more.

---

## Full Description (HTML)

<h2>Everything is built. Now just ship it.</h2>

<p>You’ve done the hard part. The feature works locally, the tests pass, the code is ready… but it’s still not live. You find yourself stuck at the end, typing things like “now what?”, “how do I push this?”, or “just ship it” — and your AI gives you a long explanation instead of simply telling you what to run.</p>

<p><strong>Task Finisher with Grok</strong> exists to remove that final friction. It looks at what you’ve already built and returns the precise, copy-pasteable sequence of commands required to finish and ship — whether that means committing, pushing, deploying, publishing, or registering a webhook.</p>

<h3>What it does</h3>
<ul>
  <li>Identifies the current state of your work</li>
  <li>Determines the correct next environment and platform</li>
  <li>Returns only the minimum commands needed to ship</li>
  <li>Formats them cleanly with one-line descriptions</li>
</ul>

<p>No explanations. No checklists. No “make sure you’ve tested first.” Just the exact commands that close the gap between “working on my machine” and “done for real.”</p>

<p>This skill pairs especially well with <strong>Agensi Skill Authoring</strong> (free) and <strong>Skill Evaluation & Iteration with Grok</strong> ($5), which help you build more reliable skills that are easier to finish and ship consistently.</p>

---

## Use Cases

- You’ve built a feature locally and now need to commit + push
- A script, tool, or service is ready but you’re unsure how to deploy it
- You need to register a webhook, set environment variables, or publish a package after development
- You’ve written a PR description and now just need to open the PR
- You’re stuck circling the final steps and want to actually ship

---

## Sample Output

**User:**  
"the API is working locally, how do I deploy this to production?"

**Output:**
```bash
# Deploy to production
cd ~/projects/my-api && git add -A && git commit -m "feat: add new endpoint" && git push && npm run deploy:prod
```

**User:**  
"the bot is ready, push commit etc"

**Output:**
```bash
# Commit and push
cd ~/Projects/my-bot && git add -A && git commit -m "feat: working bot" && git push
```

---

## FAQ

**Q: Does this skill do the work for me?**  
A: No. It only gives you the exact commands needed to finish what you’ve already built. You still run them yourself.

**Q: Will it explain what the commands do?**  
A: No. It returns only the commands plus a very short one-line description. The goal is speed and clarity at the finish line.

**Q: Can it help me decide *what* to build or how to implement something?**  
A: No. Task Finisher is strictly for the final shipping step. Use planning or authoring skills earlier in the process.

**Q: What if I’m not sure which platform I’m deploying to?**  
A: The skill makes the best assumption based on your project and conversation history. You can always correct it faster than explaining everything from scratch.

**Q: Is this the same as a general deployment assistant?**  
A: No. Most deployment assistants try to teach or guide. This skill assumes you’ve already done the work and just need the final commands to ship.

**Recommended Tags:**  
`productivity`, `devops`, `deployment`, `finishing`, `shipping`, `grok`

---

## Notes for the User

- This copy leans hard into the **"finish barrier"** pain point (a pattern that performed well in other trending skills).
- The tone is direct and slightly irreverent — matching the skill’s no-nonsense personality.
- The Sample Output is strong and shows immediate value.
- It creates a natural path toward **Skill Evaluation & Iteration with Grok ($5)** by implying that better skills = easier and more consistent shipping.
- Kept relatively short and punchy, which works well for free, high-intent productivity skills.

---

This should convert well as a free hook while gently guiding users toward the paid meta suite. Let me know if you want a slightly softer or more educational version.