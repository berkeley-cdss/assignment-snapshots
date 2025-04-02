from flask import Flask, request, render_template
import difflib

app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        file1_content = request.form["file1"].splitlines()
        file2_content = request.form["file2"].splitlines()

        differ = difflib.HtmlDiff()
        diff_html = differ.make_file(file1_content, file2_content)
        with open("templates/diff.html", "w") as f:
            f.write(diff_html)
        return render_template("diff.html", diff_html=diff_html)
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
